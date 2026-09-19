import { FullRoadmapData, SystemHealth } from '@/types';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API] Could not retrieve session access token:', err);
    }
  }
  return headers;
}

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/health`, {
      headers: { ...authHeaders }
    });
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getSampleResume(role: string = 'frontend'): Promise<string> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/sample-resume?role=${encodeURIComponent(role)}`, {
      headers: { ...authHeaders }
    });
    if (!res.ok) throw new Error('Failed to load sample resume');
    const data = await res.json();
    return data.resume;
  },

  async analyzeResume(params: {
    userId: string;
    targetRole: string;
    hoursPerWeek: number;
    preferredStyle: string;
    resumeText?: string;
    resumeFile?: File;
    storagePath?: string;
  }): Promise<FullRoadmapData> {
    const authHeaders = await getAuthHeaders();
    let body: any;
    let headers: Record<string, string> = { ...authHeaders };

    if (params.resumeFile) {
      const formData = new FormData();
      formData.append('userId', params.userId);
      formData.append('targetRole', params.targetRole);
      formData.append('hoursPerWeek', params.hoursPerWeek.toString());
      formData.append('preferredStyle', params.preferredStyle);
      formData.append('resumeFile', params.resumeFile);
      if (params.storagePath) {
        formData.append('storagePath', params.storagePath);
      }
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        userId: params.userId,
        targetRole: params.targetRole,
        hoursPerWeek: params.hoursPerWeek,
        preferredStyle: params.preferredStyle,
        resumeText: params.resumeText,
        storagePath: params.storagePath
      });
    }

    const res = await fetch(`${API_BASE}/analyze-resume`, {
      method: 'POST',
      headers,
      body
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to analyze resume and generate roadmap');
    }

    return res.json();
  },

  async getRoadmap(userId: string): Promise<FullRoadmapData> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/roadmap/${userId}`, {
      headers: { ...authHeaders }
    });
    if (!res.ok) throw new Error('Failed to fetch roadmap');
    return res.json();
  },

  async toggleTask(taskId: string, isCompleted: boolean): Promise<boolean> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ is_completed: isCompleted })
    });
    return res.ok;
  },

  async reportStruggle(params: {
    roadmapId: string;
    weekId: string;
    targetRole: string;
    strugglingWeek: any;
    struggleNotes?: string;
  }): Promise<any> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/roadmap/struggle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to trigger remedial adaptation');
    }

    return res.json();
  },

  async chatWithCopilot(params: {
    message: string;
    targetRole: string;
    activeWeek: any;
    strugglePoints: string[];
    history?: any[];
  }): Promise<string> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get copilot answer');
    }

    const data = await res.json();
    return data.reply;
  }
};
