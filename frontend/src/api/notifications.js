import { apiFetch } from './client.js';

// GET /api/notifications — latest 50 notifications (read + unread)
export async function getNotifications() {
  const json = await apiFetch('/notifications');
  return json.data;
}

// PATCH /api/notifications/:id/read — mark one as read
export async function markRead(id) {
  const json = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  return json.data;
}

// PATCH /api/notifications/read-all — mark all as read
export async function markAllRead() {
  const json = await apiFetch('/notifications/read-all', { method: 'PATCH' });
  return json.data;
}
