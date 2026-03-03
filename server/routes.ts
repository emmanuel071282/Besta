import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.products.list.path, async (req, res) => {
    const productsList = await storage.getProducts();
    res.json(productsList);
  });

  app.get(api.products.getByCategory.path, async (req, res) => {
    const category = req.params.category;
    const productsList = await storage.getProductsByCategory(category);
    res.json(productsList);
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

  // Optional: Seed the database
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      const seedData = [
        {
          name: "Premium Linen Shirt",
          description: "Breathable, high-quality linen shirt for a sophisticated summer look.",
          price: "2499",
          imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
          category: "Mens"
        },
        {
          name: "Tailored Chino Trousers",
          description: "Slim-fit chinos crafted from stretch-cotton twill for all-day comfort.",
          price: "2999",
          imageUrl: "https://images.unsplash.com/photo-1624371414361-e67094c24944?q=80&w=800&auto=format&fit=crop",
          category: "Mens"
        },
        {
          name: "Satin Wrap Dress",
          description: "Elegant satin wrap dress with a graceful drape, perfect for evening occasions.",
          price: "4599",
          imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
          category: "Ladies"
        },
        {
          name: "Cashmere Blend Cardigan",
          description: "Luxuriously soft cardigan featuring a relaxed silhouette and ribbed trims.",
          price: "3899",
          imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b49302194?q=80&w=800&auto=format&fit=crop",
          category: "Ladies"
        },
        {
          name: "Organic Cotton Kids Set",
          description: "Two-piece set made from soft organic cotton jersey for ultimate comfort.",
          price: "1599",
          imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop",
          category: "Kids"
        },
        {
          name: "Quilted Winter Jacket",
          description: "Lightweight yet warm quilted jacket with a water-repellent finish.",
          price: "2499",
          imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
          category: "Kids"
        },
        {
          name: "Handcrafted Leather Loafers",
          description: "Classic loafers made from premium Italian leather with a polished finish.",
          price: "5499",
          imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop",
          category: "Footwear"
        },
        {
          name: "Minimalist Chronograph Watch",
          description: "Sleek stainless steel watch with a minimalist dial and leather strap.",
          price: "7999",
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
          category: "Accessories"
        }
      ];

      for (const p of seedData) {
        await storage.createProduct(p);
      }
      console.log("Database seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
