import { apiFetch } from './client.js';

// POST /api/friends/add — send a friend request by username
export async function addFriend(username) {
  const json = await apiFetch('/friends/add', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  return json.data;
}

// GET /api/friends — accepted friends list with pet data
export async function getFriends() {
  const json = await apiFetch('/friends');
  return json.data;
}

// GET /api/friends/leaderboard — friends + self ranked by XP
export async function getLeaderboard() {
  const json = await apiFetch('/friends/leaderboard');
  return json.data;
}

// GET /api/friends/requests — incoming pending friend requests
export async function getFriendRequests() {
  const json = await apiFetch('/friends/requests');
  return json.data;
}

// POST /api/friends/:id/accept — accept a pending request
export async function acceptRequest(id) {
  const json = await apiFetch(`/friends/${id}/accept`, { method: 'POST' });
  return json.data;
}

// DELETE /api/friends/:id — remove friend or decline request
export async function removeOrDecline(id) {
  const json = await apiFetch(`/friends/${id}`, { method: 'DELETE' });
  return json.data;
}
