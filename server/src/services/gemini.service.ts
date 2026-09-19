import { 
  getGeminiModel, 
  getGeminiAdaptationModel, 
  getGeminiChatModel, 
  isGeminiConfigured,
  FALLBACK_MODELS,
  modelName
} from '../config/gemini';
import { geminiLimiter } from '../config/limiter';
import { 
  GeminiGapAnalysisResponse, 
  RemedialAdaptationResponse, 
  MilestoneTask, 
  RoadmapWeek 
} from '../types';

export class GeminiService {
  // Simple in-memory cache to deduplicate identical profile + target role requests
  private static analysisCache = new Map<string, GeminiGapAnalysisResponse>();

  /**
   * Helper to get ordered candidate models to try
   */
  private static getCandidateModels(): string[] {
    const list = [
      process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      ...FALLBACK_MODELS,
      'gemini-flash-latest'
    ];
    // deduplicate preserving order
    return list.filter((m, i, arr) => m && arr.indexOf(m) === i);
  }

  /**
   * Performs structured Gap Analysis and generates a dynamic weekly sprint plan
   */
  public static async analyzeSkillGaps(params: {
    targetRole: string;
    hoursPerWeek: number;
    preferredStyle: string;
    sanitizedResume: string;
  }): Promise<GeminiGapAnalysisResponse> {
    const { targetRole, hoursPerWeek, preferredStyle, sanitizedResume } = params;

    // Cache key based on role and trimmed resume hash
    const cacheKey = `${targetRole.toLowerCase()}_${hoursPerWeek}_${sanitizedResume.slice(0, 100)}`;
    if (this.analysisCache.has(cacheKey)) {
      console.info(`[GeminiService] Cache hit for "${targetRole}" - avoiding redundant API call`);
      return this.analysisCache.get(cacheKey)!;
    }

    if (!isGeminiConfigured) {
      console.warn('[GeminiService] Live Gemini API key not detected. Generating tailored intelligent schema response.');
      const fallback = this.generateTailoredFallback(targetRole, hoursPerWeek, preferredStyle, sanitizedResume);
      return fallback;
    }

    // Free-tier lean prompt instruction
    const prompt = `
You are EduPath, an elite career mentor and AI skill gap engine.
Analyze the user's sanitized resume against the TARGET ROLE: "${targetRole}".

Parameters:
- Weekly Available Study Time: ${hoursPerWeek} hours/week.
- Preferred Learning Medium: ${preferredStyle} (e.g., documentation, videos, projects).

Requirements:
1. Extract 'acquired_skills': confirmed existing skills evident in the resume.
2. Identify 'skill_gaps': missing prerequisites and required technologies for "${targetRole}". 
   Label priority as "critical" (must have), "high", or "medium".
3. Formulate a progressive 'weekly_plan' broken into 4 to 8 weekly sprints based on study hours.
   Each week must have 3-4 specific actionable tasks with canonical resources (MDN, official docs, freeCodeCamp, high-yield videos).
4. Include 'portfolio_projects': 2 real-world applied projects (for Week 2-3 and final weeks) demonstrating mastery of the gaps.

User Resume Content:
"""
${sanitizedResume}
"""
`;

    const candidates = this.getCandidateModels();
    let lastError: any = null;

    for (const candModel of candidates) {
      const model = getGeminiModel(candModel);
      if (!model) continue;

      try {
        console.info(`[GeminiService] Executing rate-limited gap analysis for "${targetRole}" with model ${candModel}...`);
        const resultJson = await geminiLimiter.schedule(async () => {
          const response = await model.generateContent(prompt);
          const text = response.response.text();
          return JSON.parse(text) as GeminiGapAnalysisResponse;
        });

        if (resultJson && Array.isArray(resultJson.acquired_skills) && Array.isArray(resultJson.weekly_plan)) {
          this.enhanceResourceUrls(resultJson);
          this.analysisCache.set(cacheKey, resultJson);
          console.info(`[GeminiService] ✅ Live analysis succeeded with model ${candModel}! Extracted ${resultJson.acquired_skills.length} skills & ${resultJson.weekly_plan.length} weeks.`);
          return resultJson;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiService] Candidate model "${candModel}" failed: ${err?.message}. Trying fallback...`);
      }
    }

    console.warn('[GeminiService] All live Gemini candidate models exhausted, using intelligent schema synthesis:', lastError?.message);
    const fallback = this.generateTailoredFallback(targetRole, hoursPerWeek, preferredStyle, sanitizedResume);
    return fallback;
  }

  /**
   * Adapts the roadmap when a user marks a sprint as "struggling"
   */
  public static async recalculateStruggleMilestone(params: {
    targetRole: string;
    strugglingWeek: RoadmapWeek;
    struggleNotes?: string;
  }): Promise<RemedialAdaptationResponse> {
    const { targetRole, strugglingWeek, struggleNotes } = params;

    if (!isGeminiConfigured) {
      console.warn('[GeminiService] Using intelligent fallback for remedial recalculation.');
      return this.generateRemedialFallback(strugglingWeek);
    }

    const prompt = `
The user is learning for the target role: "${targetRole}".
They are currently STRUGGLING on:
Week ${strugglingWeek.week_number}: "${strugglingWeek.title}"
Objective: "${strugglingWeek.learning_objective}"
Existing Tasks: ${(strugglingWeek.tasks || []).map((t: any) => t.task_title || t.title || t).join(', ') || 'Core sprint objectives'}
User's specific struggle notes: "${struggleNotes || 'Stuck on foundational concepts and syntax error debugging.'}"

Generate a focused remedial adaptation in JSON:
1. Provide a reassuring 'explanation'.
2. Provide 2-3 specific 'remedial_tasks' breaking down the blocker with canonical docs or video links.
3. Adjust 'adjusted_subsequent_weeks' (if needed) to allow time to catch up.
`;

    const candidates = this.getCandidateModels();
    for (const candModel of candidates) {
      const model = getGeminiAdaptationModel(candModel);
      if (!model) continue;

      try {
        const adaptationJson = await geminiLimiter.schedule(async () => {
          const response = await model.generateContent(prompt);
          const text = response.response.text();
          return JSON.parse(text) as RemedialAdaptationResponse;
        });

        if (adaptationJson && Array.isArray(adaptationJson.remedial_tasks)) {
          console.info(`[GeminiService] ✅ Remedial adaptation generated with model ${candModel}`);
          return adaptationJson;
        }
      } catch (err: any) {
        console.warn(`[GeminiService] Remedial model "${candModel}" failed: ${err?.message}.`);
      }
    }

    return this.generateRemedialFallback(strugglingWeek);
  }

  /**
   * Context-Aware Learning Copilot Chat (Lean context window)
   */
  public static async copilotChat(params: {
    message: string;
    targetRole: string;
    activeWeek: {
      week_number: number;
      title: string;
      learning_objective: string;
    };
    strugglePoints: string[];
    history?: { role: 'user' | 'model'; content: string }[];
  }): Promise<string> {
    const { message, targetRole, activeWeek, strugglePoints } = params;

    if (!isGeminiConfigured) {
      return this.generateCopilotMockResponse(message, activeWeek);
    }

    const systemInstruction = `
You are the EduPath Learning Copilot, a senior technical mentor assisting an engineer preparing for the "${targetRole}" role.
Active Sprint Context:
- Currently on Week ${activeWeek.week_number}: "${activeWeek.title}"
- Active Objective: "${activeWeek.learning_objective}"
- Known User Struggle Points: ${strugglePoints.length ? strugglePoints.join('; ') : 'None reported yet'}.

Guidelines:
- Keep answers concise, highly practical, and encourage hands-on debugging.
- Use Markdown and concise code snippets where applicable.
- Tailor explanations directly to this week's sprint objective.
`;

    const candidates = this.getCandidateModels();
    for (const candModel of candidates) {
      const chatModel = getGeminiChatModel(candModel);
      if (!chatModel) continue;

      try {
        return await geminiLimiter.schedule(async () => {
          const chat = chatModel.startChat({
            systemInstruction: {
              role: 'system',
              parts: [{ text: systemInstruction }]
            }
          });

          const response = await chat.sendMessage(message);
          return response.response.text();
        });
      } catch (err: any) {
        console.warn(`[GeminiService] Copilot candidate "${candModel}" failed: ${err?.message}.`);
      }
    }

    return `Here are key recommendations for **${activeWeek.title}**:\n\n1. **Focus on Hands-On Practice**: Build a small isolated proof-of-concept for this week's sprint.\n2. **Break Down Complexities**: Isolate difficult syntax errors using unit tests or type-checking.\n3. **Consult Documentation**: Refer to official guides for ${targetRole} best practices.`;
  }

  /**
   * Automatically enriches resource URLs with reliable documentation & learning links
   */
  private static enhanceResourceUrls(data: GeminiGapAnalysisResponse) {
    for (const week of data.weekly_plan) {
      for (const task of week.tasks) {
        if (!task.resource_url) {
          const q = encodeURIComponent(task.resource_query || task.task_title);
          if (task.resource_type === 'documentation') {
            task.resource_url = `https://developer.mozilla.org/en-US/search?q=${q}`;
          } else if (task.resource_type === 'video') {
            task.resource_url = `https://www.youtube.com/results?search_query=${q}`;
          } else if (task.resource_type === 'exercise') {
            task.resource_url = `https://www.freecodecamp.org/news/search/?query=${q}`;
          } else {
            task.resource_url = `https://github.com/search?q=${q}&type=repositories`;
          }
        }
      }
    }
  }

  /**
   * Extracts recognized technical skills from candidate resume text
   */
  private static extractSkillsFromResume(sanitizedResume?: string): string[] {
    if (!sanitizedResume || sanitizedResume.trim().length < 10) {
      return ['Core Programming Principles', 'Git Version Control', 'Data Structures & Algorithms', 'Problem Solving'];
    }
    const candidateKeywords = [
      'Java', 'Spring', 'Spring Boot', 'Hibernate', 'Python', 'JavaScript', 'TypeScript',
      'HTML', 'CSS', 'React', 'Node.js', 'Express', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
      'Git', 'Docker', 'Kubernetes', 'AWS', 'Linux', 'C', 'C++', 'C#', 'Data Structures',
      'Algorithms', 'OOP', 'REST APIs', 'JUnit', 'Pandas', 'NumPy', 'FastAPI', 'Redis'
    ];
    const found: string[] = [];
    for (const skill of candidateKeywords) {
      const re = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(sanitizedResume)) {
        found.push(skill);
      }
    }
    return found.length >= 2 ? found : ['Core Programming Principles', 'Git & GitHub', 'Data Structures & Algorithms'];
  }

  /**
   * Realistic, high-fidelity fallback when API key is pending or experiencing demand spikes
   */
  private static generateTailoredFallback(
    targetRole: string,
    hoursPerWeek: number,
    preferredStyle: string,
    sanitizedResume?: string
  ): GeminiGapAnalysisResponse {
    const roleLower = targetRole.toLowerCase();
    const candidateSkills = this.extractSkillsFromResume(sanitizedResume);

    const isJava = roleLower.includes('java') || roleLower.includes('spring');
    const isAiData = roleLower.includes('ai') || 
                     roleLower.includes('data') || 
                     roleLower.includes('python') ||
                     roleLower.includes('machine learning');
    const isCloudDevOps = roleLower.includes('cloud') || 
                          roleLower.includes('devops') || 
                          roleLower.includes('kubernetes') || 
                          roleLower.includes('docker') || 
                          roleLower.includes('aws');
    const isFrontend = roleLower.includes('frontend') || 
                       roleLower.includes('react') || 
                       roleLower.includes('ui') || 
                       roleLower.includes('angular') || 
                       roleLower.includes('vue');

    // ==================== 1. JAVA DEVELOPER PATH ====================
    if (isJava) {
      return {
        acquired_skills: candidateSkills.length > 0 ? candidateSkills : ['Object-Oriented Programming (OOP)', 'Git', 'Data Structures', 'Basic SQL', 'C / Python Fundamentals'],
        skill_gaps: [
          { skill: 'Java 21 & Modern JVM Ecosystem (Records, Pattern Matching, Virtual Threads)', priority: 'critical', category: 'critical_gap' },
          { skill: 'Spring Boot 3 & Spring MVC RESTful Architecture', priority: 'critical', category: 'critical_gap' },
          { skill: 'Spring Data JPA & Hibernate ORM Persistence', priority: 'critical', category: 'critical_gap' },
          { skill: 'Enterprise Relational Databases (PostgreSQL / MySQL, Indexing & Transactions)', priority: 'high', category: 'critical_gap' },
          { skill: 'Automated Testing with JUnit 5, Mockito & MockMvc', priority: 'high', category: 'adjacent' },
          { skill: 'Docker Containerization & Microservice Deployment', priority: 'medium', category: 'adjacent' }
        ],
        weekly_plan: [
          {
            week_number: 1,
            title: 'Java 21 Fundamentals, Modern OOP & Collections Framework',
            learning_objective: 'Master Java 21 syntax, OOP encapsulation/polymorphism, Collections (List, Map, Set), and the Streams API.',
            tasks: [
              {
                task_title: 'Java 21 Syntax, Records, Sealed Classes & Pattern Matching',
                resource_type: 'documentation',
                resource_query: 'Oracle Java SE 21 Language Features',
                resource_url: 'https://docs.oracle.com/en/java/javase/21/'
              },
              {
                task_title: 'Deep Dive: Java Collections Framework, Generics & Stream API Pipelines',
                resource_type: 'exercise',
                resource_query: 'Baeldung Java Streams Tutorial',
                resource_url: 'https://www.baeldung.com/java-8-streams'
              },
              {
                task_title: 'Object-Oriented Design Principles (SOLID) Applied in Java',
                resource_type: 'video',
                resource_query: 'SOLID Principles in Java Tutorial',
                resource_url: 'https://www.youtube.com/results?search_query=solid+principles+java'
              }
            ]
          },
          {
            week_number: 2,
            title: 'Spring Boot 3 REST APIs, Dependency Injection & Validation',
            learning_objective: 'Build enterprise REST controllers, dependency injection with Spring IoC, and Bean Validation.',
            tasks: [
              {
                task_title: 'Spring Boot 3 Architecture & Inversion of Control (IoC / DI)',
                resource_type: 'documentation',
                resource_query: 'Spring Boot Official Quickstart',
                resource_url: 'https://spring.io/quickstart'
              },
              {
                task_title: 'Implement CRUD REST Endpoints with Jakarta Validation & Global Exception Handlers',
                resource_type: 'exercise',
                resource_query: 'Baeldung Spring Boot REST API',
                resource_url: 'https://www.baeldung.com/building-a-restful-web-service-with-spring-and-java-based-configuration'
              },
              {
                task_title: 'Auto-Generate OpenAPI / Swagger Documentation with Springdoc-OpenAPI',
                resource_type: 'project',
                resource_query: 'Springdoc OpenAPI 3 Guide',
                resource_url: 'https://springdoc.org/'
              }
            ]
          },
          {
            week_number: 3,
            title: 'Database Persistence with Spring Data JPA & Hibernate',
            learning_objective: 'Connect to PostgreSQL, model relational entities with JPA, and optimize repository queries.',
            tasks: [
              {
                task_title: 'JPA Entity Relationships (@OneToMany, @ManyToMany, FetchType.LAZY)',
                resource_type: 'documentation',
                resource_query: 'Hibernate ORM User Guide Entity Mapping',
                resource_url: 'https://hibernate.org/orm/documentation/'
              },
              {
                task_title: 'Spring Data JPA Repositories, Derived Queries & Pagination',
                resource_type: 'exercise',
                resource_query: 'Baeldung Spring Data JPA Repository',
                resource_url: 'https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa'
              },
              {
                task_title: 'Database Migrations with Flyway & Connection Pool Tuning (HikariCP)',
                resource_type: 'video',
                resource_query: 'Flyway Spring Boot Database Migration',
                resource_url: 'https://www.youtube.com/results?search_query=spring+boot+flyway+migration'
              }
            ]
          },
          {
            week_number: 4,
            title: 'Automated Testing, Spring Security & Microservice Containerization',
            learning_objective: 'Unit test with JUnit 5 & Mockito, secure endpoints with JWT, and package into a Docker container.',
            tasks: [
              {
                task_title: 'Unit & Integration Testing with JUnit 5, Mockito & MockMvc',
                resource_type: 'exercise',
                resource_query: 'Testing Spring Boot Applications Baeldung',
                resource_url: 'https://www.baeldung.com/spring-boot-testing'
              },
              {
                task_title: 'Stateless Authentication with Spring Security 6 & JWT Tokens',
                resource_type: 'documentation',
                resource_query: 'Spring Security 6 Architecture',
                resource_url: 'https://docs.spring.io/spring-security/reference/index.html'
              },
              {
                task_title: 'Multi-Stage Dockerfile for Spring Boot Native Executables / JARs',
                resource_type: 'project',
                resource_query: 'Dockerizing a Spring Boot Application',
                resource_url: 'https://spring.io/guides/gs/spring-boot-docker/'
              }
            ]
          }
        ],
        portfolio_projects: [
          {
            week_number: 2,
            title: 'Enterprise E-Commerce RESTful Backend Service',
            description: 'Build a production-grade backend with Spring Boot 3, Spring Data JPA, PostgreSQL, Jakarta Bean Validation, and Swagger API documentation.',
            requirements: [
              'Implement complete CRUD with relational entity mappings (@ManyToOne, @OneToMany)',
              'Global controller advice with structured RFC 7807 Problem Detail error handling',
              'Database migrations managed with Flyway and integrated with Docker Compose'
            ],
            suggested_tech_stack: ['Java 21', 'Spring Boot 3', 'Spring Data JPA', 'PostgreSQL', 'Docker', 'Maven']
          },
          {
            week_number: 4,
            title: 'Event-Driven Distributed Microservices Architecture',
            description: 'Develop a resilient microservices backend utilizing Spring Cloud, JWT authorization, distributed tracing, and containerized deployment.',
            requirements: [
              'Role-based access control with Spring Security 6 and stateless JWT tokens',
              'Automated test suite achieving 80%+ test coverage using JUnit 5 and Mockito',
              'Multi-stage Dockerfile with health checks and Docker Compose orchestration'
            ],
            suggested_tech_stack: ['Java 21', 'Spring Boot 3', 'Spring Security', 'JUnit 5 / Mockito', 'PostgreSQL', 'Docker']
          }
        ]
      };
    }

    if (isAiData) {
      return {
        acquired_skills: ['Python Basics', 'Pandas', 'NumPy', 'Git', 'Basic SQL', 'Jupyter Notebooks'],
        skill_gaps: [
          { skill: 'PyTorch / Deep Learning Foundations', priority: 'critical', category: 'critical_gap' },
          { skill: 'Vector Databases & Embeddings (pgvector / Chroma)', priority: 'critical', category: 'critical_gap' },
          { skill: 'FastAPI Microservice Deployment', priority: 'high', category: 'critical_gap' },
          { skill: 'Prompt Engineering & LangChain / LlamaIndex', priority: 'high', category: 'adjacent' },
          { skill: 'Docker Containerization for ML', priority: 'medium', category: 'adjacent' }
        ],
        weekly_plan: [
          {
            week_number: 1,
            title: 'Modern PyTorch Tensors & Neural Network Mechanics',
            learning_objective: 'Master tensor math, backpropagation, and build standard multi-layer perceptrons.',
            tasks: [
              {
                task_title: 'PyTorch Tensor Fundamentals & GPU Memory Management',
                resource_type: 'documentation',
                resource_query: 'PyTorch Tensors Official Deep Dive',
                resource_url: 'https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html'
              },
              {
                task_title: 'Build a Custom PyTorch Neural Network Module from Scratch',
                resource_type: 'exercise',
                resource_query: 'Building nn.Module in PyTorch',
                resource_url: 'https://pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html'
              },
              {
                task_title: 'Hands-on Loss Functions & Optimizer Tuning (AdamW, Cosine Annealing)',
                resource_type: 'video',
                resource_query: 'Andrej Karpathy Neural Networks Zero to Hero',
                resource_url: 'https://www.youtube.com/watch?v=VMj-3S1tku0'
              }
            ]
          },
          {
            week_number: 2,
            title: 'Vector Embeddings & Semantic Search with pgvector',
            learning_objective: 'Understand high-dimensional vector similarity, cosine distance, and Supabase pgvector indexes.',
            tasks: [
              {
                task_title: 'Text Embeddings Generation with HuggingFace Transformers',
                resource_type: 'documentation',
                resource_query: 'HuggingFace Sentence Transformers Guide',
                resource_url: 'https://huggingface.co/blog/getting-started-with-embeddings'
              },
              {
                task_title: 'Configure pgvector in PostgreSQL & Execute HNSW Similarity Queries',
                resource_type: 'documentation',
                resource_query: 'Supabase Vector pgvector Quickstart',
                resource_url: 'https://supabase.com/docs/guides/database/extensions/pgvector'
              },
              {
                task_title: 'Build a Semantic Search CLI Utility over Technical Documentation',
                resource_type: 'project',
                resource_query: 'Semantic Search python pgvector project',
                resource_url: 'https://github.com/supabase/supabase/tree/master/examples/ai'
              }
            ]
          },
          {
            week_number: 3,
            title: 'Retrieval Augmented Generation (RAG) Architecture',
            learning_objective: 'Connect embedding retrieval with Gemini Flash models for hallucinations-free document Q&A.',
            tasks: [
              {
                task_title: 'Chunking Strategies: Recursive Text Splitters & Token Windows',
                resource_type: 'documentation',
                resource_query: 'LangChain Text Splitter Patterns',
                resource_url: 'https://python.langchain.com/docs/concepts/#text-splitters'
              },
              {
                task_title: 'Context Injection & Prompt Grounding with Gemini 2.5 Flash',
                resource_type: 'exercise',
                resource_query: 'Google AI Studio Gemini Structured Prompts',
                resource_url: 'https://ai.google.dev/gemini-api/docs/structured-output'
              },
              {
                task_title: 'Evaluation Metrics: Faithfulness, Context Recall, and Latency',
                resource_type: 'article',
                resource_query: 'Ragas RAG Evaluation Framework',
                resource_url: 'https://docs.ragas.io/'
              }
            ]
          },
          {
            week_number: 4,
            title: 'High-Performance API Serving with FastAPI & Docker',
            learning_objective: 'Package your AI agent into an async FastAPI microservice and containerize for production.',
            tasks: [
              {
                task_title: 'Async Streaming Endpoints in FastAPI with SSE',
                resource_type: 'documentation',
                resource_query: 'FastAPI Streaming Response Docs',
                resource_url: 'https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse'
              },
              {
                task_title: 'Production Multi-Stage Dockerfile with GPU/CPU Optimization',
                resource_type: 'exercise',
                resource_query: 'Docker for Python ML Microservices',
                resource_url: 'https://docs.docker.com/language/python/build-images/'
              }
            ]
          }
        ],
        portfolio_projects: [
          {
            week_number: 2,
            title: 'Enterprise Knowledge Base Semantic Search Engine',
            description: 'Build a production-grade semantic search and document retrieval engine using Python, HuggingFace embeddings, and PostgreSQL pgvector.',
            requirements: [
              'Extract and chunk PDF & Markdown documents into 500-token semantic chunks',
              'Generate 768-dim embeddings and store in pgvector with HNSW indexing',
              'Query with cosine similarity and return citations with highlighted source excerpts'
            ],
            suggested_tech_stack: ['Python 3.11', 'FastAPI', 'Supabase pgvector', 'SentenceTransformers', 'Docker']
          },
          {
            week_number: 4,
            title: 'Full-Stack Autonomous RAG AI Agent with Streaming Interface',
            description: 'Develop an end-to-end question answering system with automated web retrieval, source attribution, and real-time response streaming.',
            requirements: [
              'Hybrid search combining vector similarity and full-text keyword BM25',
              'Integration with Gemini 2.5 Flash using structured output schemas',
              'Real-time streaming frontend dashboard with latency metrics'
            ],
            suggested_tech_stack: ['FastAPI', 'Google Gemini API', 'React / Next.js', 'PostgreSQL', 'TailwindCSS']
          }
        ]
      };
    }

    // ==================== 3. CLOUD & DEVOPS PATH ====================
    if (isCloudDevOps) {
      return {
        acquired_skills: candidateSkills.length > 0 ? candidateSkills : ['Linux / Bash', 'Git & CI/CD Basics', 'Networking Fundamentals', 'Python / Scripting'],
        skill_gaps: [
          { skill: 'Docker Containerization & Multi-Stage Builds', priority: 'critical', category: 'critical_gap' },
          { skill: 'Kubernetes Cluster Architecture & Pod Orchestration', priority: 'critical', category: 'critical_gap' },
          { skill: 'Infrastructure as Code with Terraform & HCL', priority: 'critical', category: 'critical_gap' },
          { skill: 'Cloud Services Architecture (AWS / GCP IAM, VPC, S3)', priority: 'high', category: 'critical_gap' },
          { skill: 'Observability & Monitoring with Prometheus & Grafana', priority: 'high', category: 'adjacent' },
          { skill: 'Automated GitHub Actions CI/CD Pipeline Security', priority: 'medium', category: 'adjacent' }
        ],
        weekly_plan: [
          {
            week_number: 1,
            title: 'Linux Systems, Networking & Docker Containerization',
            learning_objective: 'Master Linux kernel basics, networking protocols, and building optimized OCI container images.',
            tasks: [
              {
                task_title: 'Linux CLI, Permissions, Systemd & Networking (TCP/IP, DNS, TLS)',
                resource_type: 'documentation',
                resource_query: 'Linux Journey Fundamentals',
                resource_url: 'https://linuxjourney.com/'
              },
              {
                task_title: 'Production Docker: Multi-stage builds, non-root users & dive analysis',
                resource_type: 'exercise',
                resource_query: 'Docker Official Best Practices Guide',
                resource_url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/'
              },
              {
                task_title: 'Compose Multi-Container Stacks with Health Checks & Secrets',
                resource_type: 'project',
                resource_query: 'Docker Compose in Production',
                resource_url: 'https://docs.docker.com/compose/'
              }
            ]
          },
          {
            week_number: 2,
            title: 'Infrastructure as Code (IaC) with Terraform & Cloud Providers',
            learning_objective: 'Provision modular cloud infrastructure using declarative Terraform configs and remote state.',
            tasks: [
              {
                task_title: 'Terraform HCL Syntax, Providers, State Management & Locking',
                resource_type: 'documentation',
                resource_query: 'HashiCorp Terraform Associate Tutorials',
                resource_url: 'https://developer.hashicorp.com/terraform/tutorials'
              },
              {
                task_title: 'Provision a Cloud VPC, Subnets, Security Groups & Bastion Host',
                resource_type: 'exercise',
                resource_query: 'Terraform VPC deployment guide',
                resource_url: 'https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest'
              }
            ]
          },
          {
            week_number: 3,
            title: 'Kubernetes Cluster Administration & Workload Orchestration',
            learning_objective: 'Deploy and manage resilient microservice workloads on Kubernetes with Ingress, Services, and ConfigMaps.',
            tasks: [
              {
                task_title: 'Kubernetes Architecture: Control Plane, Kubelet, Pods, Deployments & Services',
                resource_type: 'documentation',
                resource_query: 'Kubernetes Concepts Official Documentation',
                resource_url: 'https://kubernetes.io/docs/concepts/'
              },
              {
                task_title: 'Ingress NGINX, Cert-Manager Automated SSL & Horizontal Pod Autoscaling (HPA)',
                resource_type: 'exercise',
                resource_query: 'Kubernetes HPA and Ingress tutorial',
                resource_url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'
              }
            ]
          },
          {
            week_number: 4,
            title: 'Continuous Delivery (CI/CD) & Production Observability',
            learning_objective: 'Build zero-downtime deployment pipelines with GitHub Actions and monitor with Prometheus & Grafana.',
            tasks: [
              {
                task_title: 'GitHub Actions Matrix Workflows, Artifact Caching & OIDC Cloud Deployments',
                resource_type: 'documentation',
                resource_query: 'GitHub Actions CI/CD Complete Guide',
                resource_url: 'https://docs.github.com/en/actions'
              },
              {
                task_title: 'Deploy Prometheus Operator & Grafana Dashboards for Cluster Metrics',
                resource_type: 'project',
                resource_query: 'kube-prometheus-stack setup',
                resource_url: 'https://github.com/prometheus-operator/kube-prometheus'
              }
            ]
          }
        ],
        portfolio_projects: [
          {
            week_number: 2,
            title: 'Modular Multi-Environment Cloud Infrastructure via Terraform',
            description: 'Automate complete multi-tier VPC network, managed database, and compute instances with reusable Terraform modules.',
            requirements: ['Remote state stored in encrypted cloud bucket with state locking', 'Zero hardcoded secrets; dynamic parameter injection', 'Automated linting with tflint and checkov security scan'],
            suggested_tech_stack: ['Terraform', 'AWS/GCP', 'TFLint', 'GitHub Actions']
          },
          {
            week_number: 4,
            title: 'Production GitOps Kubernetes Platform with Automated Telemetry',
            description: 'Deploy a self-healing microservice cluster using ArgoCD / Helm, automated TLS certificates, and real-time Grafana metrics.',
            requirements: ['Automated deployment triggered via git commit tags', 'Prometheus alerting rules with notification channels', 'Zero-downtime rolling updates with liveness and readiness probes'],
            suggested_tech_stack: ['Kubernetes', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'Docker']
          }
        ]
      };
    }

    // ==================== 4. FRONTEND / REACT SPECIALIST PATH ====================
    if (isFrontend) {
      return {
        acquired_skills: candidateSkills.length > 0 ? candidateSkills : ['HTML5 / CSS3', 'JavaScript (ES6+)', 'React Basics', 'Git Version Control', 'Web Fundamentals'],
        skill_gaps: [
          { skill: 'TypeScript Generics & Strict Type-Driven Development', priority: 'critical', category: 'critical_gap' },
          { skill: 'Next.js 15 App Router, RSC & Server Actions', priority: 'critical', category: 'critical_gap' },
          { skill: 'Server State & Caching with TanStack Query v5', priority: 'high', category: 'critical_gap' },
          { skill: 'Modern CSS Architectures, TailwindCSS & Fluid Motion', priority: 'high', category: 'adjacent' },
          { skill: 'Web Performance Optimization (CWV: LCP, INP, CLS)', priority: 'medium', category: 'adjacent' }
        ],
        weekly_plan: [
          {
            week_number: 1,
            title: 'Production TypeScript & Modern React Component Patterns',
            learning_objective: 'Master strict TypeScript typing, generics, utility types, and polymorphic React component patterns.',
            tasks: [
              {
                task_title: 'Master TypeScript Generics, Discriminated Unions & Utility Types',
                resource_type: 'documentation',
                resource_query: 'TypeScript Handbook Generics & Unions',
                resource_url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html'
              },
              {
                task_title: 'Type-Safe React Props, ComponentRef, and Event Handling',
                resource_type: 'exercise',
                resource_query: 'React TypeScript Cheatsheet',
                resource_url: 'https://react-typescript-cheatsheet.netlify.app/'
              },
              {
                task_title: 'Refactor an Untyped React Form with Zod and React Hook Form',
                resource_type: 'project',
                resource_query: 'Zod schema validation with React',
                resource_url: 'https://zod.dev/'
              }
            ]
          },
          {
            week_number: 2,
            title: 'Server State Management: TanStack Query & Optimistic UI',
            learning_objective: 'Replace ad-hoc useEffect data fetching with optimistic updates, caching, and mutation lifecycles.',
            tasks: [
              {
                task_title: 'TanStack Query Core Principles: Query Keys, StaleTime, and Invalidation',
                resource_type: 'documentation',
                resource_query: 'TanStack Query Quickstart Guide',
                resource_url: 'https://tanstack.com/query/latest/docs/framework/react/overview'
              },
              {
                task_title: 'Implement Optimistic UI Updates on a Task Board',
                resource_type: 'video',
                resource_query: 'TanStack Query Optimistic Updates Tutorial',
                resource_url: 'https://www.youtube.com/results?search_query=tanstack+query+optimistic+updates'
              }
            ]
          },
          {
            week_number: 3,
            title: 'Next.js App Router, Server Actions & Edge Caching',
            learning_objective: 'Build full-stack applications with React Server Components, streaming SSR, and edge optimizations.',
            tasks: [
              {
                task_title: 'Deep Dive: Server Components vs Client Components in Next.js',
                resource_type: 'documentation',
                resource_query: 'Next.js App Router Architecture',
                resource_url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components'
              },
              {
                task_title: 'Mutating Data via Server Actions with Progressive Enhancement',
                resource_type: 'video',
                resource_query: 'Next.js Server Actions Complete Masterclass',
                resource_url: 'https://www.youtube.com/results?search_query=nextjs+server+actions'
              }
            ]
          },
          {
            week_number: 4,
            title: 'Design Systems, Accessibility (a11y) & Core Web Vitals',
            learning_objective: 'Build accessible UI component libraries and optimize for Sub-second LCP and low INP.',
            tasks: [
              {
                task_title: 'Radix UI Primitives, ARIA Attributes & Keyboard Navigation',
                resource_type: 'documentation',
                resource_query: 'Radix UI Primitives Documentation',
                resource_url: 'https://www.radix-ui.com/primitives/docs/overview/introduction'
              },
              {
                task_title: 'Auditing Core Web Vitals (LCP, INP, CLS) and Bundle Tree Shaking',
                resource_type: 'article',
                resource_query: 'Web.dev optimize core web vitals',
                resource_url: 'https://web.dev/explore/fast'
              }
            ]
          }
        ],
        portfolio_projects: [
          {
            week_number: 2,
            title: 'Real-Time Collaborative Sprint Board with Optimistic UI',
            description: 'A responsive Kanban board featuring drag-and-drop state, type-safe API queries, and optimistic updates.',
            requirements: ['Full TypeScript strict mode with zero any types', 'TanStack Query caching with optimistic task status transitions', 'Accessible modal dialogs and keyboard navigation'],
            suggested_tech_stack: ['React', 'TypeScript', 'TanStack Query', 'TailwindCSS', 'Vite']
          },
          {
            week_number: 4,
            title: 'Enterprise Design System & Accessible Component Showcase',
            description: 'A component library adhering to WAI-ARIA standards with automated accessibility tests and Storybook documentation.',
            requirements: ['Keyboard navigation with focus trap and aria live regions', 'Lighthouse score of 98+ on Performance and Accessibility', 'Responsive theme tokens supporting high-contrast mode'],
            suggested_tech_stack: ['Next.js 15', 'TypeScript', 'TailwindCSS', 'Radix UI']
          }
        ]
      };
    }

    // ==================== 5. DYNAMIC GENERAL ROLE PATH (Custom Target Role) ====================
    return {
      acquired_skills: candidateSkills.length > 0 ? candidateSkills : ['Software Engineering Foundations', 'Git Version Control', 'Data Structures & Algorithms', 'Problem Solving'],
      skill_gaps: [
        { skill: `${targetRole} Core Technologies & Modern Frameworks`, priority: 'critical', category: 'critical_gap' },
        { skill: `${targetRole} Architecture & System Design Principles`, priority: 'critical', category: 'critical_gap' },
        { skill: 'Production Database Integration & Data Modeling', priority: 'high', category: 'critical_gap' },
        { skill: 'Automated Testing, CI/CD & Deployment', priority: 'high', category: 'adjacent' },
        { skill: 'Performance Profiling & Observability', priority: 'medium', category: 'adjacent' }
      ],
      weekly_plan: [
        {
          week_number: 1,
          title: `${targetRole} Syntax & Foundational Engineering`,
          learning_objective: `Master the fundamental programming models, idioms, and standard libraries required for ${targetRole}.`,
          tasks: [
            {
              task_title: `Deep Dive into Core Language & Idioms for ${targetRole}`,
              resource_type: 'documentation',
              resource_query: `${targetRole} best practices guide`,
              resource_url: 'https://developer.mozilla.org/en-US/'
            },
            {
              task_title: `Hands-on Coding Drills & Algorithmic Problem Solving for ${targetRole}`,
              resource_type: 'exercise',
              resource_query: `${targetRole} practical code challenges`,
              resource_url: 'https://www.freecodecamp.org/news/'
            }
          ]
        },
        {
          week_number: 2,
          title: `${targetRole} Application Architecture & Data Layer`,
          learning_objective: `Implement clean architectural layers, database connectivity, and structured APIs for ${targetRole}.`,
          tasks: [
            {
              task_title: `Architectural Patterns (Clean / Layered Architecture) in ${targetRole}`,
              resource_type: 'documentation',
              resource_query: `${targetRole} clean architecture guide`,
              resource_url: 'https://github.com/search?q=clean+architecture'
            },
            {
              task_title: `Relational & Key-Value Storage Integration`,
              resource_type: 'project',
              resource_query: `${targetRole} database integration tutorial`,
              resource_url: 'https://supabase.com/docs/guides/database'
            }
          ]
        },
        {
          week_number: 3,
          title: `Automated Testing, Security & Verification for ${targetRole}`,
          learning_objective: `Implement comprehensive unit tests, security sanitization, and regression test suites.`,
          tasks: [
            {
              task_title: `Automated Unit Testing & Mocking Frameworks in ${targetRole}`,
              resource_type: 'exercise',
              resource_query: `${targetRole} automated testing best practices`,
              resource_url: 'https://www.freecodecamp.org/news/'
            },
            {
              task_title: `OWASP Security Fundamentals & Token-Based Authentication`,
              resource_type: 'documentation',
              resource_query: 'OWASP Top 10 API Security Risks',
              resource_url: 'https://owasp.org/www-project-top-ten/'
            }
          ]
        },
        {
          week_number: 4,
          title: `Production Deployment, Containerization & Portfolio Capstone`,
          learning_objective: `Containerize and deploy a production-ready application demonstrating ${targetRole} expertise.`,
          tasks: [
            {
              task_title: `Containerize ${targetRole} Application with Docker`,
              resource_type: 'documentation',
              resource_query: `Docker containerization for ${targetRole}`,
              resource_url: 'https://docs.docker.com/'
            },
            {
              task_title: `Deploy and Validate Production Metrics & Health Checks`,
              resource_type: 'project',
              resource_query: `${targetRole} deployment guide`,
              resource_url: 'https://github.com/'
            }
          ]
        }
      ],
      portfolio_projects: [
        {
          week_number: 2,
          title: `Modular Applied Backend / Service for ${targetRole}`,
          description: `Build an enterprise application demonstrating clean architecture, reliable persistence, and robust error handling for ${targetRole}.`,
          requirements: [
            `Adhere to idiomatic conventions and modern design patterns for ${targetRole}`,
            'Include end-to-end unit tests and validation guards',
            'Full documentation and runnable development environment'
          ],
          suggested_tech_stack: [targetRole, 'PostgreSQL', 'Docker', 'Git']
        },
        {
          week_number: 4,
          title: `Production-Grade Capstone System for ${targetRole}`,
          description: `A fully deployed system showcasing advanced features, automated CI/CD pipeline, and telemetry monitoring for ${targetRole}.`,
          requirements: [
            'Containerized deployment with multi-stage Docker builds',
            'Security audited with secret management and TLS encryption',
            'Live monitoring dashboard with health check endpoints'
          ],
          suggested_tech_stack: [targetRole, 'Docker', 'CI/CD', 'Cloud Provider']
        }
      ]
    };
  }

  private static generateRemedialFallback(strugglingWeek: RoadmapWeek): RemedialAdaptationResponse {
    return {
      struggling_week_number: strugglingWeek.week_number,
      explanation: `We noticed you're encountering friction with ${strugglingWeek.title}. This is one of the most foundational steps in the journey, so we've injected targeted remedial practice drills before you move ahead!`,
      remedial_tasks: [
        {
          task_title: `[Remedial Drill] Interactive code sandbox: 5 focused syntax exercises on ${strugglingWeek.title}`,
          resource_type: 'exercise',
          resource_query: `${strugglingWeek.title} beginner drill exercises`,
          resource_url: 'https://www.freecodecamp.org/news/'
        },
        {
          task_title: `[Concept Breakdown] Watch a step-by-step visual animation of core mechanics`,
          resource_type: 'video',
          resource_query: `${strugglingWeek.title} visual animated guide`,
          resource_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(strugglingWeek.title + ' tutorial for beginners')}`
        }
      ],
      adjusted_subsequent_weeks: [
        {
          week_number: strugglingWeek.week_number + 1,
          adjusted_title: `Applied Consolidation & Next Milestone Prep`,
          learning_objective: `Consolidate remedial mastery and transition smoothly into higher-level workflows.`
        }
      ]
    };
  }

  private static generateCopilotMockResponse(message: string, activeWeek: any): string {
    return `### EduPath Copilot 💡

Here is actionable guidance for your question regarding **Week ${activeWeek.week_number}: ${activeWeek.title}**:

When working through *${activeWeek.learning_objective}*, focus on isolating one component at a time:

\`\`\`typescript
// Quick pattern to solve common state and async handling
async function executeSprintObjective() {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch milestone data');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Sprint debugging checkpoint:', err);
  }
}
\`\`\`

**Key Takeaways:**
1. Keep the data structures minimal before adding advanced features.
2. Check your browser developer tools / console output for exact error traces.
3. Don't hesitate to mark individual tasks as complete as soon as you verify their output!

*(Live Gemini Copilot connection will be active once GEMINI_API_KEY is configured in your server/.env)*`;
  }
}
