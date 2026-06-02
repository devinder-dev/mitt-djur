import { apiFetch } from './client.js';

export async function getMe() {
  const json = await apiFetch('/users/me');
  return json.data;
}

export async function updateMe(body) {
  const json = await apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return json.data;
}

export async function completeOnboarding(petAnimal, goals) {
  const json = await apiFetch('/users/me/onboarding', {
    method: 'PATCH',
    body: JSON.stringify({ petAnimal, goals }),
  });
  return json.data;
}

// GET /api/users/me/streak — current streak count + last streak date
export async function getStreak() {
  const json = await apiFetch('/users/me/streak');
  return json.data;
}

// GET /api/users/me/coins — current coin balance
export async function getCoins() {
  const json = await apiFetch('/users/me/coins');
  return json.data;
}
