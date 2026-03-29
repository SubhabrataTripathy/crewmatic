const API_BASE = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ── Companies ──
export const api = {
  companies: {
    list: () => request<any[]>('/companies'),
    get: (id: string) => request<any>(`/companies/${id}`),
    create: (data: { name: string; description?: string; type?: string }) =>
      request<any>('/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/companies/${id}`, { method: 'DELETE' }),
  },

  agents: {
    list: (companyId?: string) => request<any[]>(`/agents${companyId ? `?company_id=${companyId}` : ''}`),
    get: (id: string) => request<any>(`/agents/${id}`),
    hire: (data: { company_id: string; name: string; type: string; role: string }) =>
      request<any>('/agents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    heartbeat: (id: string) =>
      request<any>(`/agents/${id}/heartbeat`, { method: 'POST' }),
    fire: (id: string) =>
      request<any>(`/agents/${id}`, { method: 'DELETE' }),
  },

  tasks: {
    list: (companyId?: string) => request<any[]>(`/tasks${companyId ? `?company_id=${companyId}` : ''}`),
    get: (id: string) => request<any>(`/tasks/${id}`),
    create: (data: { company_id: string; title: string; priority?: string; agent_id?: string }) =>
      request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/tasks/${id}`, { method: 'DELETE' }),
  },

  budget: {
    get: (companyId: string) => request<any>(`/budget/${companyId}`),
    update: (companyId: string, data: any) =>
      request<any>(`/budget/${companyId}`, { method: 'PUT', body: JSON.stringify(data) }),
    costs: (companyId: string) => request<any[]>(`/budget/${companyId}/costs`),
    summary: (companyId: string) => request<any>(`/budget/${companyId}/summary`),
  },

  audit: {
    list: (companyId?: string, type?: string) => {
      const params = new URLSearchParams();
      if (companyId) params.set('company_id', companyId);
      if (type && type !== 'all') params.set('type', type);
      return request<any[]>(`/audit?${params}`);
    },
  },

  goals: {
    list: (companyId?: string) => request<any[]>(`/goals${companyId ? `?company_id=${companyId}` : ''}`),
    create: (data: { company_id: string; title: string; description?: string }) =>
      request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/goals/${id}`, { method: 'DELETE' }),
  },

  settings: {
    get: (companyId: string) => request<any>(`/settings/${companyId}`),
    update: (companyId: string, data: Record<string, string>) =>
      request<any>(`/settings/${companyId}`, { method: 'PUT', body: JSON.stringify(data) }),
    reset: (companyId: string) =>
      request<any>(`/settings/${companyId}/reset`, { method: 'PUT' }),
  },

  health: () => request<any>('/health'),
};
