import { FullRoadmapData } from '@/types';

export const JUDGE_DEMO_DATA: FullRoadmapData = {
  roadmap: {
    id: 'roadmap_demo_judge_2026',
    user_id: 'user_alex_chen_demo',
    target_role: 'Senior Full-Stack AI Engineer',
    total_weeks: 6,
    status: 'in_progress'
  },
  profile: {
    id: 'user_alex_chen_demo',
    target_role: 'Senior Full-Stack AI Engineer',
    hours_per_week: 14,
    preferred_learning_style: 'Project-First & Interactive'
  },
  skills: [
    {
      id: 'skill_1',
      skill_name: 'TypeScript & React 19',
      category: 'acquired',
      proficiency_rating: 4,
      verified_via: 'Portfolio Projects & Experience'
    },
    {
      id: 'skill_2',
      skill_name: 'RESTful API & Express',
      category: 'acquired',
      proficiency_rating: 4,
      verified_via: 'Backend internship experience'
    },
    {
      id: 'skill_3',
      skill_name: 'Tailwind CSS & Design Tokens',
      category: 'acquired',
      proficiency_rating: 5,
      verified_via: 'Design system implementations'
    },
    {
      id: 'skill_4',
      skill_name: 'PostgreSQL & Relational Schema',
      category: 'adjacent',
      proficiency_rating: 3,
      verified_via: 'Academic database coursework'
    },
    {
      id: 'skill_5',
      skill_name: 'Docker & Containerization',
      category: 'adjacent',
      proficiency_rating: 2,
      verified_via: 'Basic Dockerfiles'
    },
    {
      id: 'skill_6',
      skill_name: 'Gemini 2.5 Flash Function Calling',
      category: 'critical_gap',
      proficiency_rating: 1,
      verified_via: 'Target role mandatory requirement'
    },
    {
      id: 'skill_7',
      skill_name: 'Vector Embeddings & pgvector RAG',
      category: 'critical_gap',
      proficiency_rating: 1,
      verified_via: 'Production AI architecture requirement'
    },
    {
      id: 'skill_8',
      skill_name: 'Next.js App Router & Server Actions',
      category: 'adjacent',
      proficiency_rating: 3,
      verified_via: 'Personal exploration'
    },
    {
      id: 'skill_9',
      skill_name: 'Distributed Caching (Redis)',
      category: 'critical_gap',
      proficiency_rating: 1,
      verified_via: 'Scale & latency benchmarks'
    }
  ],
  weeks: [
    {
      id: 'week_1',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 1,
      title: 'Advanced TypeScript Architecture & Generics',
      learning_objective: 'Master conditional types, branded types, and type-safe API schema contracts with Zod.',
      status: 'completed',
      tasks: [
        {
          id: 'task_1_1',
          week_id: 'week_1',
          task_title: 'Study TypeScript 5.4+ utility types and template literal types',
          resource_type: 'documentation',
          resource_url: 'https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html',
          is_completed: true
        },
        {
          id: 'task_1_2',
          week_id: 'week_1',
          task_title: 'Implement end-to-end type validation pipeline using Zod & TRPC patterns',
          resource_type: 'exercise',
          resource_url: 'https://zod.dev',
          is_completed: true
        },
        {
          id: 'task_1_3',
          week_id: 'week_1',
          task_title: 'Refactor state stores with immutable TypeScript Discriminated Unions',
          resource_type: 'project',
          is_completed: true
        }
      ]
    },
    {
      id: 'week_2',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 2,
      title: 'Gemini 2.5 Flash Multimodal & Function Calling',
      learning_objective: 'Integrate Google AI Studio APIs with structured JSON output schemas and deterministic tools.',
      status: 'in_progress',
      tasks: [
        {
          id: 'task_2_1',
          week_id: 'week_2',
          task_title: 'Authenticate Gemini 2.5 Flash SDK and configure strict JSON schema validation',
          resource_type: 'documentation',
          resource_url: 'https://ai.google.dev/gemini-api/docs',
          is_completed: true
        },
        {
          id: 'task_2_2',
          week_id: 'week_2',
          task_title: 'Build automated function calling agent for live weather, SQL querying, and calculator tools',
          resource_type: 'exercise',
          is_completed: false
        },
        {
          id: 'task_2_3',
          week_id: 'week_2',
          task_title: 'Benchmark latency differences between Gemini 2.5 Flash and older generation models',
          resource_type: 'article',
          is_completed: false
        }
      ]
    },
    {
      id: 'week_3',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 3,
      title: 'Vector Embeddings, Supabase pgvector & Semantic RAG',
      learning_objective: 'Implement chunking, vector embeddings with text-embedding-004, and cosine similarity indexing.',
      status: 'struggling',
      is_remedial: true,
      tasks: [
        {
          id: 'task_3_1',
          week_id: 'week_3',
          task_title: 'Configure PostgreSQL pgvector extension with IVFFlat and HNSW index structures',
          resource_type: 'documentation',
          resource_url: 'https://supabase.com/docs/guides/database/extensions/pgvector',
          is_completed: false
        },
        {
          id: 'task_3_2',
          week_id: 'week_3',
          task_title: '[Adapted by AI] Remedial deep dive: Visual explanation of Vector Dot Product & Cosine Distance',
          resource_type: 'video',
          resource_url: 'https://www.youtube.com',
          is_completed: true
        },
        {
          id: 'task_3_3',
          week_id: 'week_3',
          task_title: '[Adapted by AI] Implement micro-chunking buffer with 10% token overlap to prevent context clipping',
          resource_type: 'exercise',
          is_completed: false
        },
        {
          id: 'task_3_4',
          week_id: 'week_3',
          task_title: 'Execute HyDE (Hypothetical Document Embeddings) retrieval pipeline with reranking',
          resource_type: 'project',
          is_completed: false
        }
      ]
    },
    {
      id: 'week_4',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 4,
      title: 'Real-Time Streaming UX & SSE Protocol',
      learning_objective: 'Build zero-latency token streaming backends with Server-Sent Events (SSE) and typewriter rendering.',
      status: 'pending',
      tasks: [
        {
          id: 'task_4_1',
          week_id: 'week_4',
          task_title: 'Architect Fastify / Express SSE endpoint handling abort controllers and client disconnects',
          resource_type: 'documentation',
          is_completed: false
        },
        {
          id: 'task_4_2',
          week_id: 'week_4',
          task_title: 'Connect React client with ReadableStream API and dynamic markdown syntax parser',
          resource_type: 'exercise',
          is_completed: false
        }
      ]
    },
    {
      id: 'week_5',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 5,
      title: 'Distributed State, Redis Caching & Rate Limiting',
      learning_objective: 'Prevent cascading failures with token-bucket algorithms and Upstash Redis rate limiters.',
      status: 'pending',
      tasks: [
        {
          id: 'task_5_1',
          week_id: 'week_5',
          task_title: 'Implement Redis sliding window rate limiter for LLM inference endpoints',
          resource_type: 'exercise',
          is_completed: false
        },
        {
          id: 'task_5_2',
          week_id: 'week_5',
          task_title: 'Cache semantic vector queries to achieve sub-15ms repeated lookup times',
          resource_type: 'project',
          is_completed: false
        }
      ]
    },
    {
      id: 'week_6',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 6,
      title: 'Production CI/CD, Container Deployment & Cloud Observability',
      learning_objective: 'Containerize full stack with multi-stage Dockerfiles and setup OpenTelemetry tracing.',
      status: 'pending',
      tasks: [
        {
          id: 'task_6_1',
          week_id: 'week_6',
          task_title: 'Write multi-stage lightweight Alpine Docker build with non-root security',
          resource_type: 'documentation',
          is_completed: false
        },
        {
          id: 'task_6_2',
          week_id: 'week_6',
          task_title: 'Deploy final portfolio capstone to production with automated health monitoring',
          resource_type: 'project',
          is_completed: false
        }
      ]
    }
  ],
  projects: [
    {
      id: 'project_1',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 2,
      title: 'Autonomous Code Reviewer & Security Auditing Agent',
      description: 'An AI GitHub Action bot that scans incoming PR diffs, executes static security audits with AST parsing, and provides interactive suggestions via Gemini 2.5 Flash.',
      requirements: [
        'GitHub Webhook / Octokit Integration',
        'Gemini 2.5 Flash Structured JSON output with severity scoring',
        'Markdown comment injection on specific line numbers',
        'Automatic CVE vulnerability cross-referencing'
      ],
      suggested_tech_stack: ['TypeScript', 'Gemini 2.5 Flash', 'Node.js', 'Octokit', 'Docker']
    },
    {
      id: 'project_2',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 4,
      title: 'Enterprise Semantic Knowledge Base with pgvector',
      description: 'Full stack RAG pipeline indexing internal technical documentation with document chunking, hybrid search (BM25 + Cosine similarity), and conversational query answers.',
      requirements: [
        'Multi-format parser (PDF, Markdown, HTML)',
        'Supabase PostgreSQL with pgvector indexing',
        'Hybrid ranking with Reciprocal Rank Fusion (RRF)',
        'Streaming chat UI with citation badge links'
      ],
      suggested_tech_stack: ['Next.js 14', 'Supabase pgvector', 'Tailwind CSS', 'Google Embeddings API']
    },
    {
      id: 'project_3',
      roadmap_id: 'roadmap_demo_judge_2026',
      week_number: 6,
      title: 'High-Throughput Multi-Tenant AI Gateway',
      description: 'Edge API gateway with dynamic token budgeting, prompt caching, fallback routing between models, and OpenTelemetry request latency dashboard.',
      requirements: [
        'Sub-10ms edge routing middleware',
        'Redis token-bucket rate limiter with tenant tiering',
        'Fallback circuit breaker to secondary LLM endpoints',
        'Prometheus & Grafana metric exporters'
      ],
      suggested_tech_stack: ['Fastify', 'Redis', 'Docker', 'Prometheus', 'Zod']
    }
  ],
  progress: {
    total_tasks: 16,
    completed_tasks: 5,
    completion_percentage: 31,
    hours_invested: 18,
    remaining_critical_gaps: 3
  }
};
