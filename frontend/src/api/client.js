const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

let accessToken = localStorage.getItem('accessToken') ?? null;

export function setToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

export function getToken() {
  return accessToken;
}

async function doRefresh() {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    setToken(null);
    throw new Error('Session expired');
  }
  const json = await res.json();
  setToken(json.data.accessToken);
  return json.data.accessToken;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body != null) headers['Content-Type'] ??= 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && accessToken) {
    try {
      const newToken = await doRefresh();
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      throw new Error('Session expired. Please log in again.');
    }
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json;
}
