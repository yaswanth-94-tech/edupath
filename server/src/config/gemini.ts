import { GoogleGenerativeAI, SchemaType, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
export const isGeminiConfigured = Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('your-key'));

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
export const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

/**
 * Strict JSON Schema for deterministic Gap Analysis and Roadmap outputs
 * according to PRD Section 5
 */
export const gapAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    acquired_skills: {
      type: SchemaType.ARRAY,
      description: 'Validated current proficiencies identified from resume',
      items: { type: SchemaType.STRING }
    },
    skill_gaps: {
      type: SchemaType.ARRAY,
      description: 'Skills needed for the target role that are missing or require reinforcement',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: { type: SchemaType.STRING },
          priority: { 
            type: SchemaType.STRING, 
            description: "critical (missing prerequisite), high (needed core skill), medium (adjacent enhancement)" 
          },
          category: {
            type: SchemaType.STRING,
            description: "Category: 'critical_gap' or 'adjacent'"
          }
        },
        required: ['skill', 'priority']
      }
    },
    weekly_plan: {
      type: SchemaType.ARRAY,
      description: 'Progressive, sequential weekly learning sprint modules',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          week_number: { type: SchemaType.INTEGER },
          title: { type: SchemaType.STRING },
          learning_objective: { type: SchemaType.STRING },
          tasks: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                task_title: { type: SchemaType.STRING },
                resource_type: { 
                  type: SchemaType.STRING, 
                  description: "One of: 'documentation', 'video', 'project', 'exercise'" 
                },
                resource_query: { 
                  type: SchemaType.STRING,
                  description: "Curated search keyword or canonical URL (e.g. MDN, freeCodeCamp, official docs)" 
                }
              },
              required: ['task_title', 'resource_type']
            }
          }
        },
        required: ['week_number', 'title', 'learning_objective', 'tasks']
      }
    },
    portfolio_projects: {
      type: SchemaType.ARRAY,
      description: 'Real-world applied projects spaced every 2 to 3 weeks of learning',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          week_number: { type: SchemaType.INTEGER },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          requirements: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          suggested_tech_stack: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ['week_number', 'title', 'description', 'requirements', 'suggested_tech_stack']
      }
    }
  },
  required: ['acquired_skills', 'skill_gaps', 'weekly_plan']
};

/**
 * Remedial Adaptation Schema for when user struggles
 */
export const remedialAdaptationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    struggling_week_number: { type: SchemaType.INTEGER },
    explanation: { type: SchemaType.STRING },
    remedial_tasks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          task_title: { type: SchemaType.STRING },
          resource_type: { type: SchemaType.STRING },
          resource_query: { type: SchemaType.STRING }
        },
        required: ['task_title', 'resource_type']
      }
    },
    adjusted_subsequent_weeks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          week_number: { type: SchemaType.INTEGER },
          adjusted_title: { type: SchemaType.STRING },
          learning_objective: { type: SchemaType.STRING }
        },
        required: ['week_number', 'adjusted_title', 'learning_objective']
      }
    }
  },
  required: ['struggling_week_number', 'explanation', 'remedial_tasks']
};

export const getGeminiModel = (selectedModel: string = modelName): GenerativeModel | null => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: selectedModel,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: gapAnalysisSchema as any,
      temperature: 0.2
    }
  });
};

export const getGeminiAdaptationModel = (selectedModel: string = modelName): GenerativeModel | null => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: selectedModel,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: remedialAdaptationSchema as any,
      temperature: 0.3
    }
  });
};

export const getGeminiChatModel = (selectedModel: string = modelName): GenerativeModel | null => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: selectedModel,
    generationConfig: {
      temperature: 0.4
    }
  });
};

