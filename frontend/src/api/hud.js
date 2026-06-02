import { apiFetch } from './client.js';

// GET /api/hud — one call for the whole home screen
// Returns: { pet, today, missions, streak, coins }
export async function getHud() {
  const json = await apiFetch('/hud');
  return json.data;
}
