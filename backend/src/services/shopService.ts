// services/shopService.ts
// Business logic for shop endpoints.
// Does NOT touch request/response — that's the controller's job.
// Does NOT query the database directly — that's the repository's job.

import { Db, ObjectId } from 'mongodb';
import shopData from '../data/shopItems.json' with { type: 'json' };
import { AppError } from '../plugins/errorHandler.ts';
import type { ShopItem } from '../models/shopModel.ts';
import type { ShopItemResponse, BuyItemResult, CoinsResponse, EquipResult } from '../types/shopTypes.ts';
import { findUserById } from '../repositories/userRepository.ts';
import { findAlivePetByUserId } from '../repositories/petRepository.ts';
import {
  addOwnedAndEquip,
  equipItem as equipItemRepo,
  unequipItem as unequipItemRepo,
  deductCoins,
} from '../repositories/shopRepository.ts';
import { checkShopAchievement } from './achievementService.ts';

const shopItems = shopData as ShopItem[];

// Animals that have their own item catalog. Anything else (legacy values,
// empty string) falls back to the raccoon so existing users keep their shop.
const ANIMALS_WITH_CATALOG = ['tvattbjorn', 'katt', 'igelkott'];
const DEFAULT_ANIMAL = 'tvattbjorn';

const resolveAnimal = (value?: string | null): string =>
  value && ANIMALS_WITH_CATALOG.includes(value) ? value : DEFAULT_ANIMAL;

// Finds the animal whose catalog this user should see — prefers the pet's
// animal, falls back to the user's onboarding choice, then the raccoon.
const getUserAnimal = async (db: Db, userId: string, petAnimal?: string | null): Promise<string> => {
  if (petAnimal && ANIMALS_WITH_CATALOG.includes(petAnimal)) return petAnimal;
  const user = await findUserById(db, userId);
  return resolveAnimal(user?.petAnimal);
};

// ─── Get Shop ─────────────────────────────────────────────────────────────────

export const getShop = async (db: Db, userId: string): Promise<ShopItemResponse[]> => {

  // Step 1: Get the user's alive pet to check what's owned/equipped
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  const owned = pet?.ownedAccessories ?? [];
  const equippedId = pet?.accessoriesEquipped?.[0] ?? null;

  // Step 2: Figure out which animal's catalog to show
  const animal = await getUserAnimal(db, userId, pet?.petAnimal);

  // Step 3: Return this animal's items with owned + equipped flags
  return shopItems
    .filter((item) => item.animal === animal)
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      animal: item.animal,
      price: item.price,
      image: item.image,
      preview: item.preview,
      owned: owned.includes(item.id),
      equipped: equippedId === item.id,
    }));
};

// ─── Buy Item ─────────────────────────────────────────────────────────────────

export const buyItem = async (db: Db, userId: string, itemId: string): Promise<BuyItemResult> => {

  // Step 1: Find the item in shopItems.json
  const item = shopItems.find((i) => i.id === itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Step 2: Get the user — we need their coin balance
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Step 3: Check user has enough coins
  if (user.coins < item.price) {
    throw new AppError(`Not enough coins — need ${item.price}, have ${user.coins}`, 400);
  }

  // Step 4: Get the alive pet — check item isn't already owned
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('No alive pet found', 404);
  }

  // Step 4b: The item must belong to this pet's animal catalog.
  // Use pet.petAnimal first (set at revive), fall back to user.petAnimal —
  // same priority order as getShop so the catalog shown always matches what can be bought.
  const expectedAnimal = resolveAnimal(pet.petAnimal ?? user.petAnimal);
  if (item.animal !== expectedAnimal) {
    throw new AppError('This item is not available for your pet', 400);
  }

  const owned = pet.ownedAccessories ?? [];
  if (owned.includes(itemId)) {
    throw new AppError('You already own this item', 400);
  }

  // Step 5: Deduct coins, mark as owned, and equip (single-slot)
  await deductCoins(db, new ObjectId(userId), item.price);
  await addOwnedAndEquip(db, new ObjectId(userId), itemId);

  // Step 6: Check shop achievement
  await checkShopAchievement(db, userId);

  // Step 7: Return result
  return {
    item: item.name,
    coinsSpent: item.price,
    coinsRemaining: user.coins - item.price,
    ownedAccessories: [...owned, itemId],
    equippedId: itemId,
  };
};

// ─── Equip Item ───────────────────────────────────────────────────────────────

export const equipItem = async (db: Db, userId: string, itemId: string): Promise<EquipResult> => {

  // Step 1: Item must exist in the catalog
  const item = shopItems.find((i) => i.id === itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Step 2: User must own it before equipping
  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('No alive pet found', 404);
  }

  const owned = pet.ownedAccessories ?? [];
  if (!owned.includes(itemId)) {
    throw new AppError('You do not own this item', 400);
  }

  // Step 3: Replace the single equip slot
  await equipItemRepo(db, new ObjectId(userId), itemId);

  return { equippedId: itemId };
};

// ─── Unequip ──────────────────────────────────────────────────────────────────

export const unequipItem = async (db: Db, userId: string): Promise<EquipResult> => {

  const pet = await findAlivePetByUserId(db, new ObjectId(userId));
  if (!pet) {
    throw new AppError('No alive pet found', 404);
  }

  await unequipItemRepo(db, new ObjectId(userId));

  return { equippedId: null };
};

// ─── Get Coins ────────────────────────────────────────────────────────────────

export const getCoins = async (db: Db, userId: string): Promise<CoinsResponse> => {

  // Step 1: Get the user's coin balance
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { coins: user.coins };
};
