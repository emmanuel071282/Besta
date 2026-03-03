import { db } from "./db";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByCategoryAndSubcategory(category: string, subcategory: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getProductsByCategoryAndSubcategory(category: string, subcategory: string): Promise<Product[]> {
    return await db.select().from(products).where(
      and(eq(products.category, category), eq(products.subcategory, subcategory))
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
}

export const storage = new DatabaseStorage();
