/**
 * JurisCore API Service
 * Pure live REST client — connects directly to the Express / Node.js MySQL backend.
 * Zero mock data, zero sample data fallback. All operations reflect live in LegalCaseDB.
 */

const BASE_URL = '/api';

// ── Core fetch helper ──────────────────────────────────────────────────────
async function request(method, endpoint, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, opts);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json.data;
}

const get    = (ep)       => request('GET',    ep);
const post   = (ep, body) => request('POST',   ep, body);
const put    = (ep, body) => request('PUT',    ep, body);
const del    = (ep)       => request('DELETE', ep);

// ── API Namespace ──────────────────────────────────────────────────────────
export const api = {
  // ── Health ───────────────────────────────────────────────────────────────
  health: () => get('/health'),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    getStats: () => get('/dashboard/stats'),
  },

  // ── Clients ─────────────────────────────────────────────────────────────
  clients: {
    getAll:   ()           => get('/clients'),
    getById:  (id)         => get(`/clients/${id}`),
    create:   (data)       => post('/clients', data),
    update:   (id, data)   => put(`/clients/${id}`, data),
    remove:   (id)         => del(`/clients/${id}`),
  },

  // ── Lawyers ─────────────────────────────────────────────────────────────
  lawyers: {
    getAll:   ()           => get('/lawyers'),
    getById:  (id)         => get(`/lawyers/${id}`),
    create:   (data)       => post('/lawyers', data),
    update:   (id, data)   => put(`/lawyers/${id}`, data),
    remove:   (id)         => del(`/lawyers/${id}`),
  },

  // ── Judges ──────────────────────────────────────────────────────────────
  judges: {
    getAll:   ()           => get('/judges'),
    getById:  (id)         => get(`/judges/${id}`),
    create:   (data)       => post('/judges', data),
    update:   (id, data)   => put(`/judges/${id}`, data),
    remove:   (id)         => del(`/judges/${id}`),
  },

  // ── Legal Cases ──────────────────────────────────────────────────────────
  cases: {
    getAll:   ()           => get('/cases'),
    getById:  (id)         => get(`/cases/${id}`),
    create:   (data)       => post('/cases', data),
    update:   (id, data)   => put(`/cases/${id}`, data),
    remove:   (id)         => del(`/cases/${id}`),
  },

  // ── Hearings ─────────────────────────────────────────────────────────────
  hearings: {
    getAll:   ()           => get('/hearings'),
    getById:  (id)         => get(`/hearings/${id}`),
    create:   (data)       => post('/hearings', data),
    update:   (id, data)   => put(`/hearings/${id}`, data),
    remove:   (id)         => del(`/hearings/${id}`),
  },

  // ── Payments ─────────────────────────────────────────────────────────────
  payments: {
    getAll:   ()           => get('/payments'),
    create:   (data)       => post('/payments', data),
    update:   (id, data)   => put(`/payments/${id}`, data),
    remove:   (id)         => del(`/payments/${id}`),
  },

  // ── Reports ──────────────────────────────────────────────────────────────
  reports: {
    cases:    (params = {}) => get('/reports/cases?'    + new URLSearchParams(params)),
    payments: (params = {}) => get('/reports/payments?' + new URLSearchParams(params)),
    hearings: ()            => get('/reports/hearings'),
  },
};

export const apiService = api;
export const apiConfig = {
  useLiveBackend: true,
  baseUrl: BASE_URL,
  databaseName: 'LegalCaseDB'
};

export default api;
