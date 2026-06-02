// types/shopTypes.ts
// TypeScript types for shop request/response bodies.

// Response type — one item in the shop list (GET /api/shop)
export type ShopItemResponse = {
  id: string;
  name: string;
  category: string;
  animal: string;
  price: number;
  image: string;
  preview: string;
  owned: boolean;         // true if in pet's ownedAccessories
  equipped: boolean;      // true if in pet's accessoriesEquipped (single-equip)
};

// Response type — what POST /api/shop/buy/:itemId sends back
// Buying auto-equips the item, so equippedId === itemId on success.
export type BuyItemResult = {
  item: string;
  coinsSpent: number;
  coinsRemaining: number;
  ownedAccessories: string[];
  equippedId: string;
};

// Response type — what POST /api/shop/equip/:itemId sends back
export type EquipResult = {
  equippedId: string | null;
};

// Response type — what GET /api/users/me/coins sends back
export type CoinsResponse = {
  coins: number;
};
