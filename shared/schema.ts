import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull().default(""),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export interface SubcategorySection {
  section: string;
  items: string[];
}

export type SubcategoryConfig = string[] | SubcategorySection[];

export const SUBCATEGORIES: Record<string, SubcategoryConfig> = {
  Mens: [
    { section: "Casual Wear", items: ["T-Shirts", "Shirts", "Trousers", "Jeans", "Jackets"] },
    { section: "Ethnic Wear", items: ["Kurtas", "Sherwanis", "Nehru Jackets"] },
    { section: "Athleisure", items: ["Joggers", "Track Pants", "Sports T-Shirts", "Hoodies"] },
    { section: "Accessories", items: ["Watches", "Belts", "Wallets", "Sunglasses"] },
    { section: "Footwear", items: ["Sneakers", "Formal Shoes", "Sandals", "Loafers"] },
  ],
  Ladies: [
    { section: "Western Wear", items: ["T-Shirts", "Tops", "Dresses", "Jeans", "Skirts", "Jackets", "Cord Sets", "Athleisure"] },
    { section: "Indian Wear", items: ["Kurtas", "Kurta Sets", "Sarees", "Lehengas"] },
    { section: "Sleepwear", items: ["Nightdresses", "Pyjama Sets"] },
    { section: "Intimate Wear", items: ["Bras", "Lingerie Sets"] },
    { section: "Footwear", items: ["Heels", "Flats", "Sneakers", "Sandals"] },
  ],
  Kids: [
    { section: "Boys", items: ["T-Shirts", "Shirts", "Jeans", "Shorts", "Jackets", "Ethnic Wear"] },
    { section: "Girls", items: ["Dresses", "Tops", "Skirts", "Leggings", "Jackets", "Ethnic Wear"] },
    { section: "Infants", items: ["Rompers", "Onesies", "Sets", "Sleepsuits"] },
    { section: "Footwear", items: ["Sneakers", "Sandals", "School Shoes", "Booties"] },
  ],
  Accessories: ["Watches", "Bags", "Belts", "Sunglasses", "Jewellery", "Scarves"],
  Footwear: ["Sneakers", "Formal Shoes", "Sandals", "Heels", "Boots", "Loafers"],
};

export function isGroupedSubcategories(config: SubcategoryConfig): config is SubcategorySection[] {
  return config.length > 0 && typeof config[0] === "object";
}

export function getAllSubcategories(config: SubcategoryConfig): string[] {
  if (isGroupedSubcategories(config)) {
    return config.flatMap((g) => g.items);
  }
  return config as string[];
}
