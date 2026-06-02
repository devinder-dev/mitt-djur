import { apiFetch } from './client.js';

// GET /api/achievements — all earned achievements with title, description, earnedAt
export async function getAchievements() {
  const json = await apiFetch('/achievements');
  return json.data;
}
