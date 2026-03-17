import { db } from "./db";
import {
  products, users, stores, inventory, orders, orderItems, supportRequests,
  type Product, type InsertProduct,
  type User, type InsertUser,
  type Store, type InsertStore,
  type Inventory, type InsertInventory,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type SupportRequest, type InsertSupportRequest,
  getSizesForProduct,
} from "@shared/schema";
import { eq, and, desc, sql, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByCategoryAndSubcategory(category: string, subcategory: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteAllProducts(): Promise<void>;

  createUser(user: InsertUser): Promise<User>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, data: Partial<InsertStore>): Promise<Store | undefined>;

  getInventory(filters?: { productId?: number; storeId?: number }): Promise<(Inventory & { productName?: string; storeName?: string })[]>;
  getInventoryByProductAndStore(productId: number, storeId: number): Promise<Inventory | undefined>;
  upsertInventory(data: InsertInventory): Promise<Inventory>;
  updateInventoryQuantity(id: number, quantity: number): Promise<Inventory | undefined>;
  getStockByProduct(productId: number): Promise<number>;

  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<(OrderItem & { productName?: string; productImage?: string })[]>;

  getDashboardStats(): Promise<{ totalOrders: number; totalRevenue: number; totalProducts: number; activeStores: number }>;
  getSalesReport(startDate: Date, endDate: Date): Promise<{ date: string; orders: number; revenue: number }[]>;
  getTopSellingProducts(limit: number): Promise<{ productId: number; name: string; totalQuantity: number; totalRevenue: number }[]>;

  createSupportRequest(data: InsertSupportRequest): Promise<SupportRequest>;
  getSupportRequests(): Promise<SupportRequest[]>;
  updateSupportRequestStatus(id: number, status: string): Promise<SupportRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  private ensureSizes(product: Product): Product {
    if (!product.sizes || product.sizes.length === 0) {
      return { ...product, sizes: getSizesForProduct(product.category, product.subcategory) };
    }
    return product;
  }

  async getProducts(): Promise<Product[]> {
    const rows = await db.select().from(products);
    return rows.map(p => this.ensureSizes(p));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const rows = await db.select().from(products).where(eq(products.category, category));
    return rows.map(p => this.ensureSizes(p));
  }

  async getProductsByCategoryAndSubcategory(category: string, subcategory: string): Promise<Product[]> {
    const rows = await db.select().from(products).where(
      and(eq(products.category, category), eq(products.subcategory, subcategory))
    );
    return rows.map(p => this.ensureSizes(p));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product ? this.ensureSizes(product) : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async deleteAllProducts(): Promise<void> {
    await db.delete(products);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobile, mobile));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values(insertStore).returning();
    return store;
  }

  async updateStore(id: number, data: Partial<InsertStore>): Promise<Store | undefined> {
    const [store] = await db.update(stores).set(data).where(eq(stores.id, id)).returning();
    return store;
  }

  async getInventory(filters?: { productId?: number; storeId?: number }): Promise<(Inventory & { productName?: string; storeName?: string })[]> {
    let query = db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        storeId: inventory.storeId,
        quantity: inventory.quantity,
        reservedQty: inventory.reservedQty,
        productName: products.name,
        storeName: stores.name,
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(stores, eq(inventory.storeId, stores.id));

    const conditions = [];
    if (filters?.productId) conditions.push(eq(inventory.productId, filters.productId));
    if (filters?.storeId) conditions.push(eq(inventory.storeId, filters.storeId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query;
    return rows.map(r => ({
      id: r.id,
      productId: r.productId,
      storeId: r.storeId,
      quantity: r.quantity,
      reservedQty: r.reservedQty,
      productName: r.productName ?? undefined,
      storeName: r.storeName ?? undefined,
    }));
  }

  async getInventoryByProductAndStore(productId: number, storeId: number): Promise<Inventory | undefined> {
    const [row] = await db.select().from(inventory).where(
      and(eq(inventory.productId, productId), eq(inventory.storeId, storeId))
    );
    return row;
  }

  async upsertInventory(data: InsertInventory): Promise<Inventory> {
    const existing = await this.getInventoryByProductAndStore(data.productId, data.storeId);
    if (existing) {
      const [updated] = await db.update(inventory)
        .set({ quantity: data.quantity, reservedQty: data.reservedQty ?? 0 })
        .where(eq(inventory.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(inventory).values(data).returning();
    return created;
  }

  async updateInventoryQuantity(id: number, quantity: number): Promise<Inventory | undefined> {
    const [updated] = await db.update(inventory).set({ quantity }).where(eq(inventory.id, id)).returning();
    return updated;
  }

  async getStockByProduct(productId: number): Promise<number> {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${inventory.quantity} - ${inventory.reservedQty}), 0)` })
      .from(inventory)
      .where(eq(inventory.productId, productId));
    return Number(result[0]?.total ?? 0);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrders(filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<Order[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(orders.status, filters.status));
    if (filters?.startDate) conditions.push(gte(orders.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(orders.createdAt, filters.endDate));

    let query = db.select().from(orders).orderBy(desc(orders.createdAt));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return await query;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { productName?: string; productImage?: string })[]> {
    const rows = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        storeId: orderItems.storeId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: orderItems.size,
        productName: products.name,
        productImage: products.imageUrl,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return rows.map(r => ({
      id: r.id,
      orderId: r.orderId,
      productId: r.productId,
      storeId: r.storeId,
      quantity: r.quantity,
      price: r.price,
      size: r.size,
      productName: r.productName ?? undefined,
      productImage: r.productImage ?? undefined,
    }));
  }

  async getDashboardStats(): Promise<{ totalOrders: number; totalRevenue: number; totalProducts: number; activeStores: number }> {
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders);

    const [productStats] = await db
      .select({ totalProducts: sql<number>`COUNT(*)` })
      .from(products);

    const [storeStats] = await db
      .select({ activeStores: sql<number>`COUNT(*)` })
      .from(stores)
      .where(eq(stores.isActive, true));

    return {
      totalOrders: Number(orderStats?.totalOrders ?? 0),
      totalRevenue: Number(orderStats?.totalRevenue ?? 0),
      totalProducts: Number(productStats?.totalProducts ?? 0),
      activeStores: Number(storeStats?.activeStores ?? 0),
    };
  }

  async getSalesReport(startDate: Date, endDate: Date): Promise<{ date: string; orders: number; revenue: number }[]> {
    const rows = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})::text`,
        orders: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate)))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    return rows.map(r => ({
      date: r.date,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }));
  }

  async getTopSellingProducts(limit: number): Promise<{ productId: number; name: string; totalQuantity: number; totalRevenue: number }[]> {
    const rows = await db
      .select({
        productId: orderItems.productId,
        name: products.name,
        totalQuantity: sql<number>`SUM(${orderItems.quantity})`,
        totalRevenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.price})`,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .groupBy(orderItems.productId, products.name)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(limit);

    return rows.map(r => ({
      productId: r.productId,
      name: r.name ?? "Unknown",
      totalQuantity: Number(r.totalQuantity),
      totalRevenue: Number(r.totalRevenue),
    }));
  }

  async createSupportRequest(data: InsertSupportRequest): Promise<SupportRequest> {
    const [req] = await db.insert(supportRequests).values(data).returning();
    return req;
  }

  async getSupportRequests(): Promise<SupportRequest[]> {
    return db.select().from(supportRequests).orderBy(desc(supportRequests.createdAt));
  }

  async updateSupportRequestStatus(id: number, status: string): Promise<SupportRequest | undefined> {
    const [updated] = await db.update(supportRequests).set({ status }).where(eq(supportRequests.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
