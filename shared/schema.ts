import { pgTable, text, serial, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  costPrice: numeric("cost_price").notNull().default("0"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull().default(""),
  sizes: text("sizes").array().default([]),
  barcode: text("barcode").unique(),
});

export const SIZE_CHART: Record<string, Record<string, string[]>> = {
  Mens: {
    default: ["S", "M", "L", "XL", "XXL"],
    Sneakers: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    "Formal Shoes": ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    Sandals: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    Loafers: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    Watches: ["Free Size"],
    Belts: ["S", "M", "L", "XL"],
    Wallets: ["Free Size"],
    Sunglasses: ["Free Size"],
  },
  Ladies: {
    default: ["XS", "S", "M", "L", "XL"],
    Heels: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    Flats: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    Sneakers: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    Sandals: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    Bras: ["30B", "32B", "32C", "34B", "34C", "36B", "36C"],
    "Lingerie Sets": ["XS", "S", "M", "L", "XL"],
    Lehengas: ["S", "M", "L", "XL"],
  },
  Kids: {
    default: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    Sneakers: ["UK 8C", "UK 9C", "UK 10C", "UK 11C", "UK 12C", "UK 13C", "UK 1", "UK 2", "UK 3"],
    Sandals: ["UK 8C", "UK 9C", "UK 10C", "UK 11C", "UK 12C", "UK 13C", "UK 1", "UK 2", "UK 3"],
    "School Shoes": ["UK 8C", "UK 9C", "UK 10C", "UK 11C", "UK 12C", "UK 13C", "UK 1", "UK 2", "UK 3"],
    Booties: ["0-6M", "6-12M", "12-18M"],
    Rompers: ["0-3M", "3-6M", "6-9M", "9-12M"],
    Onesies: ["0-3M", "3-6M", "6-9M", "9-12M"],
    Sets: ["0-3M", "3-6M", "6-12M", "1-2Y"],
    Sleepsuits: ["0-3M", "3-6M", "6-9M", "9-12M"],
  },
  Accessories: {
    default: ["Free Size"],
    Belts: ["S", "M", "L", "XL"],
    Watches: ["Free Size"],
    Bags: ["Free Size"],
    Sunglasses: ["Free Size"],
    Jewellery: ["Free Size"],
    Scarves: ["Free Size"],
  },
  Footwear: {
    default: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    Sneakers: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    "Formal Shoes": ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    Sandals: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    Heels: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"],
    Boots: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    Loafers: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
  },
  Cosmetics: {
    default: ["Free Size"],
    "Lip Colour": ["Free Size"],
    Foundation: ["Free Size"],
    Blush: ["Free Size"],
    Eyeshadow: ["Free Size"],
    Kajal: ["Free Size"],
    Mascara: ["Free Size"],
    "Nail Polish": ["Free Size"],
    "Skin Care": ["Free Size"],
    "Hair Care": ["Free Size"],
    Fragrance: ["Free Size"],
    "Makeup Kit": ["Free Size"],
  },
};

export function getSizesForProduct(category: string, subcategory: string): string[] {
  const catSizes = SIZE_CHART[category];
  if (!catSizes) return ["Free Size"];
  return catSizes[subcategory] || catSizes.default || ["Free Size"];
}

export const insertProductSchema = createInsertSchema(products).omit({ id: true, barcode: true });

export function generateEAN13Barcode(productId: number): string {
  const prefix = "890";
  const company = "0000";
  const productPart = String(productId).padStart(5, "0");
  const partial = prefix + company + productPart;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(partial[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return partial + String(checkDigit);
}

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
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  eyebrow: text("eyebrow").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Shop Now"),
  ctaLink: text("cta_link").notNull().default("/summer"),
  heroImageUrl: text("hero_image_url").notNull().default(""),
  promoCode: text("promo_code").notNull(),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: numeric("discount_value").notNull().default("10"),
  minOrder: numeric("min_order").notNull().default("0"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
});

export const insertCampaignSchema = createInsertSchema(campaigns)
  .omit({ id: true })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    discountValue: z.union([z.string(), z.number()]).transform((v) => String(v)),
    minOrder: z.union([z.string(), z.number()]).transform((v) => String(v)),
  });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const DISCOUNT_TYPES = ["percent", "flat", "shipping"] as const;
export type DiscountType = typeof DISCOUNT_TYPES[number];

export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull(),
  mobile: text("mobile").notNull(),
  type: text("type").notNull(),
  orderNumber: text("order_number").notNull(),
  itemDescription: text("item_description").notNull(),
  reason: text("reason").notNull(),
  extraDetails: text("extra_details").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({ id: true, createdAt: true });
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type SupportRequest = typeof supportRequests.$inferSelect;

export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  mobile: text("mobile").notNull(),
  otp: text("otp").notNull(),
  type: text("type").notNull(),
  verified: boolean("verified").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
});

// Session table used by connect-pg-simple for express-session storage.
// Defined here so drizzle-kit doesn't try to drop it during migrations.
export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// ---------------------------------------------------------------------------
// AI Stylist — WhatsApp conversation history
// ---------------------------------------------------------------------------
export const stylistConversations = pgTable("stylist_conversations", {
  id: serial("id").primaryKey(),
  mobile: text("mobile").notNull(),
  role: text("role").notNull(),          // "user" | "assistant"
  message: text("message").notNull(),
  productIds: text("product_ids"),       // comma-separated product IDs recommended
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStylistConversationSchema = createInsertSchema(stylistConversations).omit({ id: true, createdAt: true });
export type InsertStylistConversation = z.infer<typeof insertStylistConversationSchema>;
export type StylistConversation = typeof stylistConversations.$inferSelect;

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
  // Geo-coordinates for nearest-store fulfillment
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
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
  promoCode: text("promo_code"),
  discountAmount: numeric("discount_amount").notNull().default("0"),
  // Razorpay payment tracking
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending | paid | failed
  // GST invoice
  invoiceNumber: text("invoice_number"),
  gstAmount: numeric("gst_amount").notNull().default("0"),
  // Shiprocket shipping
  fulfilledFromStoreId: integer("fulfilled_from_store_id"),
  shiprocketOrderId: text("shiprocket_order_id"),
  shiprocketShipmentId: text("shiprocket_shipment_id"),
  awbNumber: text("awb_number"),
  courierName: text("courier_name"),
  trackingUrl: text("tracking_url"),
  logisticsCost: numeric("logistics_cost").notNull().default("0"),
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
  costPrice: numeric("cost_price").notNull().default("0"),
  size: text("size"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export const ORDER_STATUSES = ["placed", "confirmed", "processing", "ready_to_ship", "shipped", "in_transit", "out_for_delivery", "delivered", "cancelled", "returned", "rto"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type Wishlist = typeof wishlists.$inferSelect;

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

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
    { section: "Casual Wear", items: ["T-Shirts", "Muscle Tees", "Shirts", "Trousers", "Jeans", "Jackets"] },
    { section: "Ethnic Wear", items: ["Kurtas", "Nehru Jackets"] },
    { section: "Athleisure", items: ["Joggers", "Track Pants", "Sports T-Shirts", "Hoodies"] },
    { section: "Accessories", items: ["Watches", "Belts", "Wallets", "Sunglasses"] },
    { section: "Footwear", items: ["Sneakers", "Formal Shoes", "Sandals", "Loafers"] },
  ],
  Ladies: [
    { section: "Western Wear", items: ["T-Shirts", "Tops", "Dresses", "Jeans", "Skirts", "Jackets", "Cord Sets", "Athleisure"] },
    { section: "Indian Wear", items: ["Kurtas", "Kurta Sets", "Cord Sets", "Lehengas"] },
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
  Cosmetics: [
    { section: "Makeup", items: ["Lip Colour", "Foundation", "Blush", "Eyeshadow", "Kajal", "Mascara", "Nail Polish", "Makeup Kit"] },
    { section: "Care", items: ["Skin Care", "Hair Care", "Fragrance"] },
  ],
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
