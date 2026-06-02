import { apiFetch } from './client.js';

export async function getToday() {
  const json = await apiFetch('/activity/today');
  return json.data;
}

export async function logActivity(type) {
  const json = await apiFetch('/activity/log', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
  return json.data;
}

export async function setMood(mood) {
  const json = await apiFetch('/activity/mood', {
    method: 'POST',
    body: JSON.stringify({ mood }),
  });
  return json.data;
}

export async function addGratitude(text) {
  const json = await apiFetch('/activity/gratitude', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return json.data;
}

export async function addNote(note) {
  const json = await apiFetch('/activity/note', {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
  return json.data;
}

export async function syncSteps(steps) {
  const json = await apiFetch('/activity/steps', {
    method: 'POST',
    body: JSON.stringify({ steps }),
  });
  return json.data;
}

// GET /api/activity/history — last 60 days of full activity logs
export async function getActivityHistory() {
  const json = await apiFetch('/activity/history');
  return json.data;
}
