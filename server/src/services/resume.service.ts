import zlib from 'zlib';

/**
 * Decode Adobe PostScript / PDF ASCII85 (<~ ... ~>) stream
 */
function decodeAscii85(str: string): Buffer {
  let clean = str.replace(/\s+/g, '');
  if (clean.endsWith('~>')) clean = clean.slice(0, -2);
  if (clean.startsWith('<~')) clean = clean.slice(2);
  const out: number[] = [];
  let tuple = 0;
  let count = 0;
  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i);
    if (c === 122 && count === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    if (c < 33 || c > 117) continue;
    tuple = tuple * 85 + (c - 33);
    count++;
    if (count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
      tuple = 0;
      count = 0;
    }
  }
  if (count > 1) {
    for (let i = 0; i < 5 - count; i++) tuple = tuple * 85 + 84;
    for (let i = 0; i < count - 1; i++) {
      out.push((tuple >>> (24 - i * 8)) & 255);
    }
  }
  return Buffer.from(out);
}

/**
 * Extracts human text strings from decompressed PDF content stream,
 * correctly handling balanced parentheses and escape sequences.
 */
function extractPdfStrings(content: string): string[] {
  const strings: string[] = [];
  let i = 0;
  while (i < content.length) {
    if (content[i] === '(') {
      i++;
      let s = '';
      let escaped = false;
      let depth = 1;
      while (i < content.length && depth > 0) {
        const ch = content[i];
        if (escaped) {
          s += ch;
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '(') {
          depth++;
          s += ch;
        } else if (ch === ')') {
          depth--;
          if (depth > 0) s += ch;
        } else {
          s += ch;
        }
        i++;
      }
      const clean = s.replace(/\\([()\\])/g, '$1').trim();
      // Filter out PDF internal Font markers and non-printable bullet tokens
      if (clean && clean.length > 0 && !clean.startsWith('/F') && clean !== '\\177') {
        strings.push(clean);
      }
    } else {
      i++;
    }
  }
  return strings;
}

export class ResumeService {
  /**
   * Extracts text from a resume buffer (PDF or plain text / markdown).
   * Strategy 0: Plain text / Markdown detection (handles .txt, .md, pasted text)
   * Strategy 1: PDF stream decompressor with ASCII85 & FlateDecode (handles ReportLab & modern PDFs)
   * Strategy 2: pdf-parse (handles standard PDFs with cross-reference tables)
   * Strategy 3: Raw ASCII printable runs fallback
   */
  public static async extractAndSanitizePdf(buffer: Buffer): Promise<string> {
    if (!buffer || buffer.length === 0) {
      throw new Error('Uploaded file is empty.');
    }

    // Strategy 0: Check if it's plain text or markdown (not a binary PDF)
    const header = buffer.slice(0, 8).toString('utf-8');
    if (!header.startsWith('%PDF')) {
      try {
        const text = buffer.toString('utf-8').trim();
        if (text.length > 20) {
          console.log('[ResumeService] ✅ Text/Markdown resume detected and extracted');
          return this.sanitizeText(text);
        }
      } catch (err: any) {
        console.warn('[ResumeService] UTF-8 plain text decode failed:', err.message);
      }
    }

    // Strategy 1: Stream decompressor (handles ReportLab, ASCII85Decode, FlateDecode)
    try {
      const str = buffer.toString('latin1');
      const streamMarker = 'stream';
      const endStreamMarker = 'endstream';
      let idx = 0;
      const allExtractedStrings: string[] = [];

      while ((idx = str.indexOf(streamMarker, idx)) !== -1) {
        let dataStart = idx + streamMarker.length;
        while (dataStart < str.length && (str.charCodeAt(dataStart) === 10 || str.charCodeAt(dataStart) === 13)) {
          dataStart++;
        }
        const end = str.indexOf(endStreamMarker, dataStart);
        if (end !== -1) {
          let dataEnd = end;
          while (dataEnd > dataStart && (str.charCodeAt(dataEnd - 1) === 10 || str.charCodeAt(dataEnd - 1) === 13)) {
            dataEnd--;
          }
          const chunkStr = str.substring(dataStart, dataEnd).trim();
          let candidateBuf = buffer.subarray(dataStart, dataEnd);

          if (chunkStr.endsWith('~>') || str.includes('/ASCII85Decode')) {
            try {
              candidateBuf = decodeAscii85(chunkStr);
            } catch {}
          }

          let decomp = '';
          try {
            decomp = zlib.inflateSync(candidateBuf).toString('latin1');
          } catch {
            try {
              decomp = zlib.inflateRawSync(candidateBuf).toString('latin1');
            } catch {
              decomp = candidateBuf.toString('latin1');
            }
          }

          if (decomp) {
            const strings = extractPdfStrings(decomp);
            if (strings.length > 0) {
              allExtractedStrings.push(...strings);
            }
          }
        }
        idx = end !== -1 ? end + endStreamMarker.length : idx + streamMarker.length;
      }

      if (allExtractedStrings.length > 5) {
        const fullText = allExtractedStrings.join('\n');
        if (fullText.trim().length > 60) {
          console.log('[ResumeService] ✅ PDF parsed via decompressed stream operator strategy. Lines:', allExtractedStrings.length);
          return this.sanitizeText(fullText);
        }
      }
    } catch (streamErr: any) {
      console.warn('[ResumeService] Stream decompress strategy warning:', streamErr.message);
    }

    // Strategy 2: Try pdf-parse
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer, {
        version: 'v1.10.100'
      });
      if (data?.text && data.text.trim().length > 20) {
        console.log('[ResumeService] ✅ PDF parsed via pdf-parse strategy');
        return this.sanitizeText(data.text);
      }
    } catch (err: any) {
      console.warn('[ResumeService] pdf-parse strategy failed:', err.message);
    }

    // Strategy 3: Raw printable ASCII extraction
    try {
      const rawText = buffer.toString('latin1');
      const textRuns = rawText.match(/[\x20-\x7E]{3,}/g) || [];
      const filtered = textRuns
        .filter(run => {
          const up = run.toUpperCase();
          return (
            run.length > 3 &&
            !up.startsWith('XREF') &&
            !up.startsWith('ENDOBJ') &&
            !up.startsWith('STREAM') &&
            !up.startsWith('ENDSTREAM') &&
            !up.startsWith('OBJ') &&
            !up.startsWith('%PDF') &&
            !/^\d+(\s+\d+)*$/.test(run.trim())
          );
        })
        .join(' ');

      if (filtered.trim().length > 50) {
        console.log('[ResumeService] ✅ PDF parsed via raw buffer extraction strategy');
        return this.sanitizeText(filtered);
      }
    } catch (rawErr: any) {
      console.warn('[ResumeService] Raw buffer extraction also failed:', rawErr.message);
    }

    // Strategy 4: If all binary PDF extractions failed
    throw new Error(
      'Could not read text from this resume file. Please try: (1) Copy-paste your resume text in the Paste tab, (2) Save as PDF/A, or (3) Upload a .txt file.'
    );
  }



  /**
   * Sanitizes raw resume text to minimize input token count:
   * 1. Strips unnecessary formatting characters and repetitive whitespace
   * 2. Isolates relevant sections (Skills, Experience, Projects, Education)
   * 3. Truncates overly verbose narratives to stay within free-tier token budgets
   */
  public static sanitizeText(rawText: string): string {
    if (!rawText) return '';

    // Normalize newlines and whitespace
    let text = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, ' ') // remove unusual non-ascii artifacts
      .replace(/\n\s*\n\s*\n+/g, '\n\n') // collapse multiple blank lines
      .replace(/ +/g, ' ')
      .trim();

    // Key sections filter (keep sections like Skills, Experience, Projects, Education, Summary)
    const sectionHeaders = [
      'TECHNICAL SKILLS', 'SKILLS', 'EXPERIENCE', 'WORK EXPERIENCE', 
      'PROFESSIONAL EXPERIENCE', 'PROJECTS', 'NOTABLE PROJECTS', 
      'EDUCATION', 'CERTIFICATIONS', 'SUMMARY', 'PROFILE'
    ];

    const lines = text.split('\n');
    const sanitizedLines: string[] = [];
    let isRelevantSection = true;

    for (const line of lines) {
      const upperTrimmed = line.trim().toUpperCase();
      // If we see headers like references or personal details, we can skip
      if (upperTrimmed.startsWith('REFERENCES') || upperTrimmed.startsWith('PERSONAL INTERESTS')) {
        isRelevantSection = false;
      } else if (sectionHeaders.some(h => upperTrimmed.includes(h))) {
        isRelevantSection = true;
      }

      if (isRelevantSection && line.trim().length > 0) {
        sanitizedLines.push(line.trim());
      }
    }

    const cleaned = sanitizedLines.join('\n');

    // Cap at 4,500 characters to strictly preserve TPM / RPM
    if (cleaned.length > 4500) {
      return cleaned.slice(0, 4500) + '\n...[sanitized for token economy]';
    }

    return cleaned.length > 0 ? cleaned : text.slice(0, 4500);
  }

  /**
   * Curated sample resumes for instant one-click testing
   */
  public static getSampleResume(role: string = 'frontend'): string {
    if (role.toLowerCase().includes('data') || role.toLowerCase().includes('ai') || role.toLowerCase().includes('python')) {
      return `
ALEX CHEN
Data Enthusiast & Junior Python Developer
Email: alex.chen@example.com | GitHub: github.com/alexchen

SUMMARY
Passionate developer with 1.5 years experience building Python automation scripts, basic pandas pipelines, and SQLite tools. Eager to advance into AI Engineering and Full-Stack Machine Learning.

TECHNICAL SKILLS
Languages: Python, SQL, JavaScript (ES6)
Libraries & Tools: Pandas, NumPy, Matplotlib, Git, SQLite, Basic Flask, Jupyter Notebooks
Concepts: Data Cleaning, REST APIs, Basic Linear Algebra

EXPERIENCE
Junior Data Automation Intern | TechSolutions Inc (2024 - 2025)
- Automated daily CSV reporting using Python scripts, saving 4 hours per week.
- Built exploratory data analysis dashboards in Jupyter using Pandas and Seaborn.
- Maintained SQL queries against PostgreSQL internal reporting tables.

PROJECTS
- Customer Churn Predictor: Built basic logistic regression model in scikit-learn on Kaggle dataset (78% accuracy).
- Web Scraper & Price Tracker: Built Python BeautifulSoup script to track GPU prices with email alerts.

EDUCATION
B.S. in Computer Science (Minor in Mathematics) - State University (2024)
`;
    }

    return `
JORDAN MORGAN
Junior Web Developer | Frontend Focus
Email: jordan.m@example.com | Portfolio: jordan-dev.io | GitHub: github.com/jordanm

SUMMARY
Self-motivated web developer with 2 years of practical experience creating interactive user interfaces with React, JavaScript, and CSS. Strong foundation in component architecture, state management, and responsive layouts. Looking to bridge skill gaps to become a senior Full Stack / Next.js Engineer.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), HTML5, CSS3, Basic TypeScript
Frameworks & Libraries: React (Hooks, Context API), TailwindCSS, Bootstrap, Vite, Redux Toolkit (Basic)
Tools: Git, GitHub, VS Code, npm, Postman
Back-End Exposure: Basic Node.js, Express REST APIs, MongoDB CRUD

EXPERIENCE
Junior Frontend Developer | CloudWave Studio (2024 - Present)
- Developed responsive marketing pages and admin dashboard components using React and Tailwind CSS.
- Integrated REST API endpoints with Axios, handling loading states and basic error boundaries.
- Optimized Lighthouse performance scores from 65 to 88 by implementing lazy loading and WebP assets.

PROJECTS
- DevLink Social: Social bookmarking web application built with React and Firebase authentication.
- E-Commerce Cart Demo: Responsive product catalog with shopping cart state, filters, and Stripe checkout mockup.

EDUCATION
B.S. in Information Technology - Tech Institute (2023)
`;
  }
}
