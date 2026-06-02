import { apiFetch } from './client.js';

// GET /api/shop — all items with owned:true if already purchased
export async function getShop() {
  const json = await apiFetch('/shop');
  return json.data;
}

// POST /api/shop/buy/:itemId — deduct coins, mark item as owned on pet
export async function buyItem(itemId) {
  const json = await apiFetch(`/shop/buy/${encodeURIComponent(itemId)}`, {
    method: 'POST',
  });
  return json.data;
}

// POST /api/shop/equip/:itemId — equip an owned item (single-equip)
export async function equipItem(itemId) {
  const json = await apiFetch(`/shop/equip/${encodeURIComponent(itemId)}`, {
    method: 'POST',
  });
  return json.data;
}

// POST /api/shop/unequip — remove the currently equipped item
export async function unequipItem() {
  const json = await apiFetch('/shop/unequip', {
    method: 'POST',
  });
  return json.data;
}

// GET /api/users/me/coins — current coin balance
export async function getCoins() {
  const json = await apiFetch('/users/me/coins');
  return json.data;
}
