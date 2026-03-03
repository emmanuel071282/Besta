import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerSchema, loginSchema, ORDER_STATUSES } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { name, mobile, email, pin, birthday } = parsed.data;

      const existing = await storage.getUserByMobile(mobile);
      if (existing) {
        return res.status(409).json({ message: "An account with this mobile number already exists" });
      }

      const hashedPin = await bcrypt.hash(pin, 10);
      const user = await storage.createUser({ name, mobile, email, pin: hashedPin, birthday });

      req.session.userId = user.id;
      res.json({ id: user.id, name: user.name, mobile: user.mobile, email: user.email, birthday: user.birthday, role: user.role });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { mobile, pin } = parsed.data;

      const user = await storage.getUserByMobile(mobile);
      if (!user) {
        return res.status(401).json({ message: "Invalid mobile number or PIN" });
      }

      const valid = await bcrypt.compare(pin, user.pin);
      if (!valid) {
        return res.status(401).json({ message: "Invalid mobile number or PIN" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, name: user.name, mobile: user.mobile, email: user.email, birthday: user.birthday, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ id: user.id, name: user.name, mobile: user.mobile, email: user.email, birthday: user.birthday, role: user.role });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    (req as any).user = user;
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
    const user = await storage.getUserById(req.session.userId);
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    (req as any).user = user;
    next();
  };

  app.get("/api/admin/dashboard", requireAdmin, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const allOrders = await storage.getOrders({ status: status || undefined, startDate, endDate });
    res.json(allOrders);
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await storage.updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.get("/api/admin/orders/:id/items", requireAdmin, async (req, res) => {
    const items = await storage.getOrderItems(Number(req.params.id));
    res.json(items);
  });

  app.get("/api/admin/sales", requireAdmin, async (req, res) => {
    const days = Number(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const report = await storage.getSalesReport(startDate, endDate);
    const topProducts = await storage.getTopSellingProducts(10);
    res.json({ report, topProducts });
  });

  app.get("/api/admin/stores", requireAdmin, async (_req, res) => {
    const allStores = await storage.getStores();
    res.json(allStores);
  });

  app.post("/api/admin/stores", requireAdmin, async (req, res) => {
    try {
      const store = await storage.createStore(req.body);
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Failed to create store" });
    }
  });

  app.patch("/api/admin/stores/:id", requireAdmin, async (req, res) => {
    const store = await storage.updateStore(Number(req.params.id), req.body);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  });

  app.get("/api/admin/inventory", requireAdmin, async (req, res) => {
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const storeId = req.query.storeId ? Number(req.query.storeId) : undefined;
    const inv = await storage.getInventory({ productId, storeId });
    res.json(inv);
  });

  app.patch("/api/admin/inventory/:id", requireAdmin, async (req, res) => {
    const { quantity } = req.body;
    const updated = await storage.updateInventoryQuantity(Number(req.params.id), quantity);
    if (!updated) return res.status(404).json({ message: "Inventory record not found" });
    res.json(updated);
  });

  app.post("/api/admin/inventory", requireAdmin, async (req, res) => {
    try {
      const inv = await storage.upsertInventory(req.body);
      res.json(inv);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  const orderBodySchema = z.object({
    items: z.array(z.object({
      productId: z.number(),
      quantity: z.number().min(1),
      price: z.string(),
    })).min(1),
    shippingName: z.string().min(1, "Name is required"),
    shippingAddress: z.string().min(1, "Address is required"),
    shippingCity: z.string().min(1, "City is required"),
    shippingState: z.string().min(1, "State is required"),
    shippingPincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
    shippingPhone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone"),
    paymentMethod: z.string().min(1, "Payment method required"),
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const parsed = orderBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const user = (req as any).user;
      const { items, shippingName, shippingAddress, shippingCity, shippingState, shippingPincode, shippingPhone, paymentMethod } = parsed.data;

      let totalAmount = 0;
      for (const item of items) {
        totalAmount += Number(item.price) * item.quantity;
      }

      const orderNumber = `BESTA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const order = await storage.createOrder({
        userId: user.id,
        orderNumber,
        status: "placed",
        totalAmount: totalAmount.toString(),
        shippingName,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPincode,
        shippingPhone,
        paymentMethod,
      });

      for (const item of items) {
        const inv = await storage.getInventory({ productId: item.productId });
        const availableStore = inv.find(i => i.quantity >= item.quantity);
        const assignedStoreId = availableStore?.storeId || null;

        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          storeId: assignedStoreId,
          quantity: item.quantity,
          price: item.price,
        });

        if (availableStore) {
          await storage.updateInventoryQuantity(availableStore.id, availableStore.quantity - item.quantity);
        }
      }

      res.json(order);
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ message: "Failed to place order" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    const user = (req as any).user;
    const userOrders = await storage.getOrdersByUser(user.id);
    res.json(userOrders);
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    const user = (req as any).user;
    const order = await storage.getOrder(Number(req.params.id));
    if (!order || order.userId !== user.id) {
      return res.status(404).json({ message: "Order not found" });
    }
    const items = await storage.getOrderItems(order.id);
    res.json({ ...order, items });
  });

  app.get(api.products.list.path, async (req, res) => {
    const productsList = await storage.getProducts();
    res.json(productsList);
  });

  app.get(api.products.getByCategory.path, async (req, res) => {
    const category = req.params.category;
    const subcategory = req.query.subcategory as string | undefined;
    
    if (subcategory) {
      const productsList = await storage.getProductsByCategoryAndSubcategory(category, subcategory);
      res.json(productsList);
    } else {
      const productsList = await storage.getProductsByCategory(category);
      res.json(productsList);
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingProducts = await storage.getProducts();
    if (existingProducts.length > 0) {
      const hasV3Subcats = existingProducts.some(p => p.subcategory === "Joggers" || p.subcategory === "Rompers" || p.subcategory === "Sherwanis");
      if (hasV3Subcats) {
        await seedStoresAndInventory();
        await seedAdminUser();
        return;
      }

      await storage.deleteAllProducts();
    }

    const seedData = [
      // ===== MENS - Casual Wear =====
      { name: "Classic Crew Neck T-Shirt", description: "Soft cotton crew neck tee with a relaxed fit, perfect for everyday styling.", price: "799", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "T-Shirts" },
      { name: "Striped Polo T-Shirt", description: "Piqué cotton polo with contrast stripes and ribbed collar.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1625910513413-5fc421e0e6f5?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "T-Shirts" },
      { name: "Premium Linen Shirt", description: "Breathable, high-quality linen shirt for a sophisticated summer look.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Shirts" },
      { name: "Oxford Button-Down Shirt", description: "Crisp oxford cotton shirt with button-down collar, a wardrobe essential.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Shirts" },
      { name: "Tailored Chino Trousers", description: "Slim-fit chinos crafted from stretch-cotton twill for all-day comfort.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1624371414361-e67094c24944?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Trousers" },
      { name: "Formal Pleated Trousers", description: "Tailored pleated trousers in fine wool blend, ideal for the office.", price: "3499", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Trousers" },
      { name: "Slim Fit Dark Wash Jeans", description: "Classic 5-pocket jeans in premium dark indigo denim with stretch.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jeans" },
      { name: "Relaxed Fit Light Jeans", description: "Comfortable relaxed-fit jeans in faded light wash denim.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jeans" },
      { name: "Leather Biker Jacket", description: "Genuine leather biker jacket with zip detailing and quilted shoulders.", price: "8999", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jackets" },
      { name: "Puffer Winter Jacket", description: "Warm padded puffer jacket with water-resistant shell and hood.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jackets" },
      // ===== MENS - Ethnic Wear =====
      { name: "Cotton Kurta Set", description: "Traditional cotton kurta with embroidered neckline, paired with churidar.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Kurtas" },
      { name: "Silk Blend Kurta", description: "Festive silk blend kurta with intricate threadwork and mandarin collar.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Kurtas" },
      { name: "Royal Blue Sherwani", description: "Regal sherwani in royal blue with gold embroidery, perfect for weddings.", price: "12999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sherwanis" },
      { name: "Ivory Silk Sherwani", description: "Elegant ivory silk sherwani with intricate zardozi work and pearl buttons.", price: "15999", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sherwanis" },
      { name: "Classic Nehru Jacket", description: "Mandarin collar Nehru jacket in textured cotton, versatile layering piece.", price: "3499", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Nehru Jackets" },
      { name: "Brocade Nehru Jacket", description: "Festive brocade Nehru jacket with silk lining, ideal for celebrations.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Nehru Jackets" },
      // ===== MENS - Athleisure =====
      { name: "Slim Fit Joggers", description: "Tapered slim-fit joggers in French terry with zip pockets.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1624371414361-e67094c24944?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Joggers" },
      { name: "Cotton Blend Joggers", description: "Relaxed cotton-blend joggers with elastic cuffs and drawstring waist.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Joggers" },
      { name: "Striped Track Pants", description: "Classic track pants with side stripe and elasticated waistband.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1624371414361-e67094c24944?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Track Pants" },
      { name: "Quick-Dry Track Pants", description: "Lightweight quick-dry track pants with mesh-lined pockets for workouts.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Track Pants" },
      { name: "Dri-Fit Sports T-Shirt", description: "Moisture-wicking sports tee with flatlock seams for gym and running.", price: "999", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sports T-Shirts" },
      { name: "Compression Sports Tee", description: "Performance compression tee with breathable mesh panels.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sports T-Shirts" },
      { name: "Fleece Pullover Hoodie", description: "Warm fleece hoodie with kangaroo pocket and adjustable drawstring hood.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Hoodies" },
      { name: "Zip-Up Training Hoodie", description: "Full-zip training hoodie in lightweight tech fabric with thumb holes.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Hoodies" },
      // ===== MENS - Accessories =====
      { name: "Mens Chronograph Watch", description: "Sleek stainless steel chronograph watch with leather strap.", price: "7999", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Watches" },
      { name: "Reversible Leather Belt", description: "Premium reversible leather belt with polished buckle, black to brown.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Belts" },
      { name: "Genuine Leather Wallet", description: "Slim bifold wallet in genuine leather with RFID protection.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Wallets" },
      { name: "Aviator Sunglasses", description: "Classic aviator sunglasses with UV400 protection and metal frame.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sunglasses" },
      // ===== MENS - Footwear =====
      { name: "Mens White Sneakers", description: "Clean white leather sneakers with cushioned insole for everyday wear.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sneakers" },
      { name: "Retro Running Sneakers", description: "Retro-inspired running sneakers with suede panels and mesh upper.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sneakers" },
      { name: "Derby Formal Shoes", description: "Classic derby shoes in polished leather for formal occasions.", price: "5999", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Formal Shoes" },
      { name: "Cap-Toe Oxford Shoes", description: "Elegant cap-toe oxford shoes handcrafted from premium calfskin.", price: "7499", imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Formal Shoes" },
      { name: "Leather Slide Sandals", description: "Minimalist leather slide sandals with contoured cork footbed.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Sandals" },
      { name: "Handcrafted Leather Loafers", description: "Classic loafers in premium Italian leather with polished finish.", price: "5499", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Loafers" },

      // ===== LADIES - Western Wear =====
      { name: "Relaxed Fit Women's T-Shirt", description: "Soft cotton tee with a relaxed drop-shoulder fit, everyday essential.", price: "799", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "T-Shirts" },
      { name: "Printed V-Neck T-Shirt", description: "Trendy V-neck tee with abstract print in breathable cotton jersey.", price: "999", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "T-Shirts" },
      { name: "Ruffle Blouse Top", description: "Feminine ruffle blouse in lightweight chiffon with tie-neck detail.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Tops" },
      { name: "Cropped Knit Top", description: "Cropped ribbed knit top with short sleeves and fitted silhouette.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Tops" },
      { name: "Satin Wrap Dress", description: "Elegant satin wrap dress with a graceful drape, perfect for evening.", price: "4599", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Dresses" },
      { name: "Floral Midi Dress", description: "Romantic floral print midi dress with puff sleeves and tiered skirt.", price: "3299", imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Dresses" },
      { name: "High-Rise Skinny Jeans", description: "Sculpting high-rise skinny jeans in power-stretch denim.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jeans" },
      { name: "Wide Leg Palazzo Jeans", description: "Trendy wide-leg palazzo jeans in light blue wash.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1475178626620-a4d074967571?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jeans" },
      { name: "Pleated Midi Skirt", description: "Elegant pleated midi skirt in satin finish with elastic waistband.", price: "2199", imageUrl: "https://images.unsplash.com/photo-1592301933927-35b597393c0a?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Skirts" },
      { name: "Denim Mini Skirt", description: "Classic denim mini skirt with raw hem and button-front closure.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1592301933927-35b597393c0a?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Skirts" },
      { name: "Cropped Denim Jacket", description: "Classic cropped denim jacket with vintage wash and brass buttons.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jackets" },
      { name: "Ribbed Cord Set", description: "Matching ribbed crop top and wide-leg trousers in soft jersey knit.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Cord Sets" },
      { name: "Linen Co-ord Set", description: "Breezy linen shirt and shorts co-ord set, perfect for summer outings.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Cord Sets" },
      { name: "Women's Jogger & Crop Top Set", description: "Matching jogger and crop top athleisure set in soft cotton blend.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Athleisure" },
      { name: "High-Waist Leggings", description: "Sculpting high-waist leggings with breathable fabric for yoga and gym.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Athleisure" },
      // ===== LADIES - Indian Wear =====
      { name: "Embroidered Anarkali Kurta", description: "Gorgeous Anarkali kurta with intricate embroidery and flared silhouette.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurtas" },
      { name: "Cotton Printed Kurta", description: "Breezy cotton kurta with block print and notched neckline.", price: "1899", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurtas" },
      { name: "Mirror Work Kurta Set", description: "Festive kurta with mirror work paired with palazzo pants and dupatta.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurta Sets" },
      { name: "Cotton Kurta Pyjama Set", description: "Comfortable cotton kurta and pyjama set with contrast piping.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurta Sets" },
      { name: "Bridal Lehenga Choli", description: "Stunning bridal lehenga with heavy embroidery, sequins and dupatta.", price: "14999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lehengas" },
      { name: "Flared Party Lehenga", description: "Vibrant flared lehenga with foil print and contrast choli.", price: "6999", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lehengas" },
      // ===== LADIES - Sleepwear =====
      { name: "Satin Nightdress", description: "Luxurious satin nightdress with lace trim and adjustable straps.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Nightdresses" },
      { name: "Cotton Maxi Nightdress", description: "Breathable cotton maxi nightdress with delicate floral print.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Nightdresses" },
      { name: "Printed Pyjama Set", description: "Cute printed button-down shirt and pyjama set in soft cotton.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Pyjama Sets" },
      { name: "Satin Pyjama Set", description: "Elegant satin pyjama set with piping detail, smooth and comfortable.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Pyjama Sets" },
      // ===== LADIES - Intimate Wear =====
      { name: "T-Shirt Bra", description: "Seamless padded T-shirt bra with smooth cups for everyday wear.", price: "899", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Bras" },
      { name: "Lace Underwire Bra", description: "Delicate lace underwire bra with adjustable straps and hook closure.", price: "1199", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Bras" },
      { name: "Lace Bralette & Brief Set", description: "Matching lace bralette and brief set in soft stretch fabric.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lingerie Sets" },
      { name: "Satin Cami & Shorts Set", description: "Luxurious satin cami and shorts lingerie set with lace edging.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lingerie Sets" },
      // ===== LADIES - Footwear =====
      { name: "Block Heel Pumps", description: "Comfortable block heel pumps in suede with pointed toe.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Heels" },
      { name: "Stiletto Heels", description: "Sleek stiletto heels in patent leather for evening glamour.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Heels" },
      { name: "Embellished Ballet Flats", description: "Elegant ballet flats with jewel embellishment and cushioned insole.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Flats" },
      { name: "Pointed Toe Flats", description: "Chic pointed-toe flats in soft leather, perfect for office to evening.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Flats" },
      { name: "Women's Canvas Sneakers", description: "Clean white canvas sneakers with platform sole for casual styling.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Sneakers" },
      { name: "Strappy Flat Sandals", description: "Elegant strappy sandals in soft leather with cushioned sole.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Sandals" },
      { name: "Wedge Heel Sandals", description: "Comfortable wedge sandals with jute-wrapped heel and ankle strap.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Sandals" },

      // ===== KIDS - Boys =====
      { name: "Boys Dinosaur Print Tee", description: "Fun dinosaur graphic tee in soft cotton jersey for little explorers.", price: "599", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "T-Shirts" },
      { name: "Boys Striped Polo", description: "Smart striped polo t-shirt in breathable piqué cotton for boys.", price: "799", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "T-Shirts" },
      { name: "Boys Check Shirt", description: "Classic check shirt in soft cotton with button-down collar for boys.", price: "999", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Shirts" },
      { name: "Boys Denim Shirt", description: "Casual denim shirt with snap buttons, cool and comfortable.", price: "1199", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Shirts" },
      { name: "Boys Slim Fit Jeans", description: "Stretchy slim-fit jeans for boys with adjustable inner waist.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Jeans" },
      { name: "Cargo Shorts", description: "Durable cotton cargo shorts with adjustable waist and side pockets.", price: "899", imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Shorts" },
      { name: "Denim Shorts", description: "Comfortable stretch denim shorts with elastic waistband.", price: "799", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Shorts" },
      { name: "Boys Quilted Jacket", description: "Lightweight quilted jacket with water-repellent finish for boys.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Jackets" },
      { name: "Boys Kurta Pyjama Set", description: "Festive cotton kurta pyjama set with embroidered motifs for boys.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Ethnic Wear" },
      { name: "Boys Sherwani Set", description: "Mini sherwani set with churidar for festive celebrations.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Ethnic Wear" },
      // ===== KIDS - Girls =====
      { name: "Girls Floral Frock", description: "Adorable floral print frock with ruffled hem and bow detail.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Dresses" },
      { name: "Party Tulle Dress", description: "Sparkly tulle party dress with sequin bodice for special occasions.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Dresses" },
      { name: "Girls Peplum Top", description: "Cute peplum top with butterfly print and flutter sleeves for girls.", price: "699", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Tops" },
      { name: "Girls Embroidered Top", description: "Pretty embroidered cotton top with lace trim and back buttons.", price: "899", imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Tops" },
      { name: "Girls Pleated Skirt", description: "Playful pleated skirt with elastic waist in fun polka dot print.", price: "799", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Skirts" },
      { name: "Girls Denim Skirt", description: "Stretchy denim skirt with heart-shaped pockets for little girls.", price: "899", imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Skirts" },
      { name: "Girls Cotton Leggings", description: "Soft stretch cotton leggings with fun printed patterns.", price: "499", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Leggings" },
      { name: "Girls Windbreaker Jacket", description: "Colourful hooded windbreaker with reflective strips for girls.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Jackets" },
      { name: "Girls Lehenga Choli", description: "Adorable lehenga choli set with mirror work and dupatta.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Ethnic Wear" },
      // ===== KIDS - Infants =====
      { name: "Cotton Romper", description: "Soft cotton romper with snap buttons for easy changing, gentle on skin.", price: "599", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Rompers" },
      { name: "Printed Dungaree Romper", description: "Adorable printed dungaree romper in organic cotton for babies.", price: "799", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Rompers" },
      { name: "Striped Onesie", description: "Cosy striped onesie with envelope neck and snap leg closure.", price: "499", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Onesies" },
      { name: "Animal Print Onesie", description: "Cute animal print onesie in ultra-soft muslin cotton for newborns.", price: "599", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Onesies" },
      { name: "Infant Gift Set", description: "5-piece infant gift set with onesie, bib, cap, mittens and booties.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sets" },
      { name: "Organic Cotton Baby Set", description: "Three-piece organic cotton set with bodysuit, pants and hat.", price: "999", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sets" },
      { name: "Fleece Sleepsuit", description: "Warm fleece sleepsuit with zip front and non-slip feet for babies.", price: "899", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sleepsuits" },
      { name: "Cotton Sleepsuit Pack", description: "Pack of 2 cotton sleepsuits with fun animal prints and snap buttons.", price: "1199", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sleepsuits" },
      // ===== KIDS - Footwear =====
      { name: "Kids Velcro Sneakers", description: "Easy velcro-strap sneakers with cushioned sole for active kids.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sneakers" },
      { name: "Kids Light-Up Sneakers", description: "Fun light-up sole sneakers that flash with every step.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sneakers" },
      { name: "Kids Sports Sandals", description: "Durable sports sandals with adjustable straps and grippy sole.", price: "899", imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sandals" },
      { name: "Kids Velcro Sandals", description: "Comfortable velcro sandals with soft footbed for everyday wear.", price: "699", imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sandals" },
      { name: "Boys Black School Shoes", description: "Smart black school shoes in durable synthetic leather.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "School Shoes" },
      { name: "Girls School Shoes", description: "Polished black school shoes with buckle strap for girls.", price: "1399", imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "School Shoes" },
      { name: "Soft Sole Baby Booties", description: "Ultra-soft booties with non-slip sole for first walkers.", price: "599", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Booties" },
      { name: "Knitted Baby Booties", description: "Hand-knitted cotton booties with elastic ankle for snug fit.", price: "499", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Booties" },

      // ===== ACCESSORIES =====
      { name: "Minimalist Chronograph Watch", description: "Sleek stainless steel watch with minimalist dial and leather strap.", price: "7999", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Watches" },
      { name: "Rose Gold Digital Watch", description: "Modern rose gold digital watch with mesh band and date display.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Watches" },
      { name: "Leather Tote Bag", description: "Spacious genuine leather tote bag with inner zip pocket.", price: "5499", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Bags" },
      { name: "Canvas Crossbody Bag", description: "Casual canvas crossbody bag with adjustable strap and brass hardware.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Bags" },
      { name: "Braided Canvas Belt", description: "Casual braided canvas belt with leather trim and metal buckle.", price: "799", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Belts" },
      { name: "Cat Eye Sunglasses", description: "Retro cat-eye sunglasses with gradient lenses and acetate frame.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Sunglasses" },
      { name: "Gold Layered Necklace", description: "Delicate gold-plated layered necklace with dainty pendants.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c6?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Jewellery" },
      { name: "Silver Hoop Earrings", description: "Sterling silver hoop earrings with brushed finish, everyday elegance.", price: "899", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Jewellery" },
      { name: "Cashmere Wool Scarf", description: "Ultra-soft cashmere wool scarf in classic plaid pattern.", price: "3499", imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Scarves" },
      { name: "Silk Print Scarf", description: "Luxurious silk scarf with artistic floral print, versatile styling.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1601924921557-45e8e0e78e68?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Scarves" },

      // ===== FOOTWEAR (standalone category) =====
      { name: "White Canvas Sneakers", description: "Clean white canvas sneakers with cushioned insole and rubber outsole.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sneakers" },
      { name: "High-Top Sneakers", description: "Bold high-top sneakers in premium leather with contrast stitching.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sneakers" },
      { name: "Oxford Formal Shoes", description: "Classic Oxford shoes in polished leather for formal occasions.", price: "5999", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Formal Shoes" },
      { name: "Leather Slide Sandals", description: "Minimalist leather slide sandals with contoured cork footbed.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sandals" },
      { name: "Strappy Flat Sandals", description: "Elegant strappy sandals in soft leather with cushioned sole.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sandals" },
      { name: "Block Heel Pumps", description: "Comfortable block heel pumps in suede with pointed toe.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Heels" },
      { name: "Chelsea Ankle Boots", description: "Classic Chelsea boots in premium leather with elastic side panel.", price: "5999", imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Boots" },
      { name: "Combat Lace-Up Boots", description: "Rugged combat boots with thick sole and sturdy lace-up closure.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Boots" },
      { name: "Suede Tassel Loafers", description: "Refined suede loafers with tassel detail and flexible rubber sole.", price: "4299", imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Loafers" },
    ];

    for (const p of seedData) {
      await storage.createProduct(p);
    }
    console.log(`Database seeded with ${seedData.length} products`);

    await seedStoresAndInventory();
    await seedAdminUser();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function seedAdminUser() {
  const existing = await storage.getUserByMobile("9999999999");
  if (existing) return;

  const hashedPin = await bcrypt.hash("0000", 10);
  await storage.createUser({
    name: "Admin",
    mobile: "9999999999",
    email: "admin@besta.in",
    pin: hashedPin,
    birthday: "1990-01-01",
    role: "admin",
  });
  console.log("Admin user seeded (mobile: 9999999999, PIN: 0000)");
}

async function seedStoresAndInventory() {
  const existingStores = await storage.getStores();
  if (existingStores.length > 0) return;

  const storeData = [
    { name: "BESTA Mumbai Central", city: "Mumbai", state: "Maharashtra", pincode: "400008", address: "Ground Floor, Phoenix Mills, Lower Parel", phone: "022-24001234", isActive: true },
    { name: "BESTA Delhi CP", city: "New Delhi", state: "Delhi", pincode: "110001", address: "N Block, Connaught Place", phone: "011-23451234", isActive: true },
    { name: "BESTA Bangalore Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038", address: "100 Feet Road, Indiranagar", phone: "080-25671234", isActive: true },
    { name: "BESTA Chennai T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600017", address: "Usman Road, T Nagar", phone: "044-24341234", isActive: true },
    { name: "BESTA Kolkata Park Street", city: "Kolkata", state: "West Bengal", pincode: "700016", address: "22 Park Street", phone: "033-22291234", isActive: true },
    { name: "BESTA Hyderabad Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034", address: "Road No. 2, Banjara Hills", phone: "040-23551234", isActive: true },
    { name: "BESTA Pune FC Road", city: "Pune", state: "Maharashtra", pincode: "411004", address: "Fergusson College Road", phone: "020-25671234", isActive: true },
    { name: "BESTA Ahmedabad SG Highway", city: "Ahmedabad", state: "Gujarat", pincode: "380054", address: "SG Highway, Bodakdev", phone: "079-26851234", isActive: true },
    { name: "BESTA Jaipur MI Road", city: "Jaipur", state: "Rajasthan", pincode: "302001", address: "MI Road, C-Scheme", phone: "0141-2371234", isActive: true },
    { name: "BESTA Lucknow Hazratganj", city: "Lucknow", state: "Uttar Pradesh", pincode: "226001", address: "Hazratganj Main Road", phone: "0522-2201234", isActive: true },
  ];

  const createdStores = [];
  for (const s of storeData) {
    const store = await storage.createStore(s);
    createdStores.push(store);
  }
  console.log(`Seeded ${createdStores.length} stores`);

  const allProducts = await storage.getProducts();
  let invCount = 0;
  for (const product of allProducts) {
    const numStores = 3 + Math.floor(Math.random() * 5);
    const shuffledStores = [...createdStores].sort(() => Math.random() - 0.5).slice(0, numStores);
    for (const store of shuffledStores) {
      const qty = 5 + Math.floor(Math.random() * 46);
      await storage.upsertInventory({
        productId: product.id,
        storeId: store.id,
        quantity: qty,
        reservedQty: 0,
      });
      invCount++;
    }
  }
  console.log(`Seeded ${invCount} inventory records`);
}
