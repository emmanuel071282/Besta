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
          name: "Classic White T-Shirt",
          description: "Essential crew neck t-shirt made from 100% organic cotton.",
          price: "15.99",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
          category: "Mens"
        },
        {
          name: "Slim Fit Denim Jeans",
          description: "Classic five-pocket styling slim-fit jeans.",
          price: "49.99",
          imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop",
          category: "Mens"
        },
        {
          name: "Floral Midi Dress",
          description: "V-neck midi dress with a ditsy floral print and short sleeves.",
          price: "39.99",
          imageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop",
          category: "Ladies"
        },
        {
          name: "Oversized Knit Sweater",
          description: "Cozy drop-shoulder sweater in a soft, ribbed knit.",
          price: "34.99",
          imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
          category: "Ladies"
        },
        {
          name: "Kids Dino Graphic Tee",
          description: "Fun dinosaur graphic t-shirt for kids, soft and durable.",
          price: "12.99",
          imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop",
          category: "Kids"
        },
        {
          name: "Toddler Pull-on Shorts",
          description: "Comfortable elastic-waist shorts for everyday play.",
          price: "14.99",
          imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop",
          category: "Kids"
        },
        {
          name: "Chunky White Sneakers",
          description: "Trendy thick-soled sneakers for a modern street style look.",
          price: "59.99",
          imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
          category: "Footwear"
        },
        {
          name: "Minimalist Leather Belt",
          description: "Classic black leather belt with a silver-tone buckle.",
          price: "19.99",
          imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop",
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
