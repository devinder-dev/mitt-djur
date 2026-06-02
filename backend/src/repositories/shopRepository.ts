// repositories/shopRepository.ts
// Handles all database writes related to shop purchases and equip state.
// Reading shop items comes from shopItems.json — not MongoDB.

import { Db, ObjectId } from 'mongodb';
import type { Pet } from '../models/petModel.ts';
import type { User } from '../models/userModel.ts';

// Step 1: Mark an item as owned AND set it as the single equipped item.
// $addToSet keeps ownedAccessories unique; $set replaces accessoriesEquipped
// with a one-element array to enforce the single-equip rule.
export async function addOwnedAndEquip(db: Db, userId: ObjectId, itemId: string): Promise<void> {
  await db.collection<Pet>('pets').updateOne(
    { userId, status: 'alive' },
    {
      $addToSet: { ownedAccessories: itemId },
      $set: { accessoriesEquipped: [itemId] },
    },
  );
}

// Step 2: Equip an item the user already owns. Replaces the single slot.
export async function equipItem(db: Db, userId: ObjectId, itemId: string): Promise<void> {
  await db.collection<Pet>('pets').updateOne(
    { userId, status: 'alive' },
    { $set: { accessoriesEquipped: [itemId] } },
  );
}

// Step 3: Clear the single equip slot.
export async function unequipItem(db: Db, userId: ObjectId): Promise<void> {
  await db.collection<Pet>('pets').updateOne(
    { userId, status: 'alive' },
    { $set: { accessoriesEquipped: [] } },
  );
}

// Step 4: Deduct coins from a user's balance after a purchase
export async function deductCoins(db: Db, userId: ObjectId, amount: number): Promise<void> {
  await db.collection<User>('users').updateOne(
    { _id: userId },
    { $inc: { coins: -amount } },
  );
}
