import { apiFetch } from './client.js';

export async function getAvailableMissions() {
  const json = await apiFetch('/missions');
  return json.data;
}

export async function getMyMissions() {
  const json = await apiFetch('/missions/my');
  return json.data;
}

export async function selectMission(id) {
  const json = await apiFetch(`/missions/select/${id}`, { method: 'POST' });
  return json.data;
}

export async function completeMission(id) {
  const json = await apiFetch(`/missions/${id}/complete`, { method: 'POST' });
  return json.data;
}
