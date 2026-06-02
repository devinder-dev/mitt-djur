import { apiFetch, setToken } from './client.js';

export async function login(email, password) {
  const json = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(json.data.accessToken);
}

export async function register(email, username, password) {
  const json = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
  setToken(json.data.accessToken);
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    setToken(null);
  }
}

export async function tryRestoreSession() {
  try {
    const res = await fetch(
      (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api') + '/auth/refresh',
      { method: 'POST', credentials: 'include' }
    );
    if (!res.ok) return false;
    const json = await res.json();
    setToken(json.data.accessToken);
    return true;
  } catch {
    return false;
  }
}
