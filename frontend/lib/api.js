const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('admin_token');
}

function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem('admin_token', token);
  else window.localStorage.removeItem('admin_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getToken,
  setToken,
  isLoggedIn: () => !!getToken(),

  login: (password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),

  getPageData: () => request('/page-data'),

  // Profile
  updateProfile: (payload) => request('/profile', { method: 'PUT', body: JSON.stringify(payload) }),

  // Sections
  createSection: (payload) => request('/sections', { method: 'POST', body: JSON.stringify(payload) }),
  updateSection: (id, payload) => request(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteSection: (id) => request(`/sections/${id}`, { method: 'DELETE' }),

  // List items
  createListItem: (payload) => request('/list-items', { method: 'POST', body: JSON.stringify(payload) }),
  updateListItem: (id, payload) => request(`/list-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteListItem: (id) => request(`/list-items/${id}`, { method: 'DELETE' }),

  // Timeline
  createTimeline: (payload) => request('/timeline', { method: 'POST', body: JSON.stringify(payload) }),
  updateTimeline: (id, payload) => request(`/timeline/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTimeline: (id) => request(`/timeline/${id}`, { method: 'DELETE' }),

  // References
  createReference: (payload) => request('/references', { method: 'POST', body: JSON.stringify(payload) }),
  updateReference: (id, payload) => request(`/references/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteReference: (id) => request(`/references/${id}`, { method: 'DELETE' }),

  // File upload — returns { url }
  upload: async (file) => {
    const token = getToken();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed');
    return data;
  },
};

export { API_URL };
