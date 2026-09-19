# EduPath (MVP) — AI-Driven Skill Gap & Personalized Learning Path Agent

EduPath is an adaptive, AI-powered learning path agent designed to analyze user resumes, perform precision skill gap evaluations against target roles, generate progressive weekly sprints with applied portfolio projects, dynamically adapt milestones upon learning friction, and provide a context-aware learning copilot.

---

## Architecture

- **Backend Server**: Node.js + Express + TypeScript
- **AI Engine**: Google AI Studio Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)
  - Deterministic Structured Output via JSON Schema
  - In-Memory Bottleneck Queue enforcing strict free-tier rate limits (10–12 RPM) with exponential backoff
- **Database & Storage**: Supabase Cloud
  - PostgreSQL Relational Schema (`profiles`, `user_skills`, `roadmaps`, `roadmap_weeks`, `milestone_tasks`, `milestone_projects`)
  - Enforced Row-Level Security (RLS) policies
  - Resilient in-memory fallback for local offline testing
- **Resume Extraction**: `pdf-parse` with lean token sanitization
- **Frontend Dashboard**: React 18 + Vite + Custom Modern Dark Obsidian & Glassmorphism Design System

---

## Quick Start

### 1. Install Dependencies
In the root directory, install dependencies for root, server, and client:

```bash
# Root
npm.cmd install

# Backend Server
cd server
npm.cmd install
cd ..

# Frontend Client
cd client
npm.cmd install
cd ..
```

### 2. Environment Configuration
Copy the template environment file in `server/`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

# Google AI Studio API Key (Free Tier)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Supabase Project Configuration (Optional for cloud sync)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> **Note:** If `GEMINI_API_KEY` or `SUPABASE_URL` are not provided, EduPath automatically activates **Intelligent Demo Mode**, allowing you to test the complete end-to-end user experience, skill gap matrix, adaptive struggle engine, and copilot locally with zero friction!

### 3. Supabase SQL Migration
If connecting to Supabase Cloud, execute the migration SQL found in:
[`supabase/migrations/20260919_init.sql`](file:///d:/websites/edupath/supabase/migrations/20260919_init.sql) in your Supabase SQL Editor.

### 4. Running the Application

You can launch both the backend API and frontend Vite server concurrently:

```bash
npm.cmd run dev
```

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health & Rate-Limiter Status**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 5. Automated Verification
Run the automated API test suite:

```bash
npm.cmd run test:api
```

---

## Core Features & Workflow

1. **Resume Intake & Lean Token Sanitization**:
   - Supports uploading PDF resumes or pasting raw text.
   - Trims extraneous metadata to preserve Gemini free-tier TPM and TPD limits.

2. **3-Tier Skill Gap Matrix**:
   - **Acquired Skills**: Confirmed existing proficiencies.
   - **Adjacent Skills**: Partially known skills needing reinforcement.
   - **Critical Gaps**: Missing prerequisites and must-learn technologies.

3. **Dynamic Weekly Sprints**:
   - Sequential sprint timeline (Week 1 through Week N).
   - Curated resource links to official documentation (MDN), video tutorials, and coding exercises.

4. **Adaptive Struggle Recalculation Engine**:
   - Click *"I'm struggling with this sprint"* on any week to trigger a targeted Gemini micro-prompt.
   - Injects remedial sub-tasks and adjusts milestone pacing in real-time.

5. **Applied Portfolio Projects**:
   - Production-grade project specifications generated every 2–3 weeks with functional requirements and suggested tech stacks.

6. **Context-Aware Learning Copilot**:
   - Conversational assistant anchored to your active week's objectives and reported struggle points.
