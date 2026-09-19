import { FullRoadmapData, SystemHealth } from './types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getSampleResume(role: string = 'frontend'): Promise<string> {
    const res = await fetch(`${API_BASE}/sample-resume?role=${encodeURIComponent(role)}`);
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
  }): Promise<FullRoadmapData> {
    let body: any;
    let headers: Record<string, string> = {};

    if (params.resumeFile) {
      const formData = new FormData();
      formData.append('userId', params.userId);
      formData.append('targetRole', params.targetRole);
      formData.append('hoursPerWeek', params.hoursPerWeek.toString());
      formData.append('preferredStyle', params.preferredStyle);
      formData.append('resumeFile', params.resumeFile);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        userId: params.userId,
        targetRole: params.targetRole,
        hoursPerWeek: params.hoursPerWeek,
        preferredStyle: params.preferredStyle,
        resumeText: params.resumeText
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
    const res = await fetch(`${API_BASE}/roadmap/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch roadmap');
    return res.json();
  },

  async toggleTask(taskId: string, isCompleted: boolean): Promise<boolean> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/roadmap/struggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
