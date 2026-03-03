import { pgTable, text, serial, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull().unique(),
  email: text("email").notNull(),
  pin: text("pin").notNull(),
  birthday: text("birthday").notNull(),
  role: text("role").notNull().default("customer"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  storeId: integer("store_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  reservedQty: integer("reserved_qty").notNull().default(0),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("placed"),
  totalAmount: numeric("total_amount").notNull(),
  shippingName: text("shipping_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingPincode: text("shipping_pincode").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  storeId: integer("store_id"),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export const ORDER_STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled", "returned"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  confirmPin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  birthday: z.string().min(1, "Birthday is required"),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"],
});

export const loginSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

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
