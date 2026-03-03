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

export const SUBCATEGORIES: Record<string, string[]> = {
  Mens: ["T-Shirts", "Shirts", "Trousers", "Jeans", "Jackets", "Kurtas", "Suits"],
  Ladies: ["Dresses", "Tops", "Kurtas", "Jeans", "Skirts", "Sarees", "Jackets"],
  Kids: ["T-Shirts", "Dresses", "Sets", "Jackets", "Shorts", "Ethnic Wear"],
  Accessories: ["Watches", "Bags", "Belts", "Sunglasses", "Jewellery", "Scarves"],
  Footwear: ["Sneakers", "Formal Shoes", "Sandals", "Heels", "Boots", "Loafers"],
};
