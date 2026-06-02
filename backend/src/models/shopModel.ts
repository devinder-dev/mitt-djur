// models/shopModel.ts
// Defines the shape of a shop item from data/shopItems.json.
// Shop items are never stored in MongoDB — they live in the JSON file.
// The pet's ownedAccessories array stores purchased item IDs.
// The pet's accessoriesEquipped array stores the single currently-worn item.

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  animal: string;    // which pet animal this item belongs to: tvattbjorn | katt | igelkott
  price: number;
  image: string;     // public path to the standalone item PNG
  preview: string;   // public path to the animal-wearing-this-item PNG
}
