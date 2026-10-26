/**
 * KaushalID Centralized API Client
 * Automatically manages JWT bearer tokens, consistent error handling,
 * and unified backend integration for workers, employers, and administrators.
 */

const BASE_URL = '/api';

function getStoredToken() {
  try {
    return localStorage.getItem('kaushalid_jwt_token') || null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    signup: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    demoLogin: (role = 'worker') => request('/auth/demo-login', { method: 'POST', body: { role } }),
    getMe: () => request('/auth/me'),
    updateProfile: (updates) => request('/auth/profile', { method: 'PUT', body: updates })
  },

  // Verification & Credentials
  verification: {
    verifyCredential: (id) => request(`/verify/${encodeURIComponent(id)}`)
  },

  // Assessment Requests
  assessments: {
    getRequests: (status) => request(`/assessment-requests${status ? `?status=${status}` : ''}`),
    createRequest: (payload) => request('/assessment-requests', { method: 'POST', body: payload }),
    reviewRequest: (id, payload) => request(`/assessment-requests/${id}/review`, { method: 'PUT', body: payload }),
    getAvailableTests: () => request('/assessments')
  },

  // Employer Tools
  employer: {
    getProfile: () => request('/employer/profile'),
    saveWorker: (workerId) => request('/employer/save-worker', { method: 'POST', body: { workerId } }),
    subscribe: (payload) => request('/employer/subscribe', { method: 'POST', body: payload })
  },

  // Workers Registry & Search
  workers: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      const qs = query.toString();
      return request(`/workers${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/workers/${id}`)
  },

  // Administrator Directorate
  admin: {
    getStats: () => request('/admin/stats'),
    getVerifications: () => request('/admin/verifications'),
    revokeCredential: (id, reason) => request(`/admin/credentials/${id}/revoke`, { method: 'PUT', body: { reason } }),
    getAuditLogs: (limit = 50) => request(`/admin/audit-logs?limit=${limit}`),
    getSettings: () => request('/admin/settings'),
    updateSettings: (settings) => request('/admin/settings', { method: 'PUT', body: settings })
  }
};

export default api;
