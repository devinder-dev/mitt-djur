import { apiFetch } from './client.js';

export async function getPet() {
  const json = await apiFetch('/pet');
  return json.data;
}

export async function updatePetName(name) {
  const json = await apiFetch('/pet/name', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  return json.data;
}

export async function getPetHistory() {
  const json = await apiFetch('/pet/history');
  return json.data;
}

export async function getAllPetsHistory() {
  const json = await apiFetch('/pet/history/all');
  return json.data;
}

export async function revivePet(name, petAnimal) {
  const json = await apiFetch('/pet/revive', {
    method: 'POST',
    body: JSON.stringify({ name, petAnimal }),
  });
  return json.data;
}
