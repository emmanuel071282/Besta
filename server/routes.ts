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
      const hasNewLadiesSubcats = existingProducts.some(p => p.subcategory === "Cord Sets" || p.subcategory === "Nightdresses" || p.subcategory === "Bras");
      if (hasNewLadiesSubcats) return;

      const { db } = await import("./db");
      const { products } = await import("@shared/schema");
      await db.delete(products);
    }

    const seedData = [
      { name: "Classic Crew Neck T-Shirt", description: "Soft cotton crew neck tee with a relaxed fit, perfect for everyday styling.", price: "799", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "T-Shirts" },
      { name: "Striped Polo T-Shirt", description: "Piqué cotton polo with contrast stripes and ribbed collar.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1625910513413-5fc421e0e6f5?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "T-Shirts" },
      { name: "Graphic Print Tee", description: "Statement graphic tee in premium organic cotton jersey.", price: "999", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "T-Shirts" },
      { name: "Premium Linen Shirt", description: "Breathable, high-quality linen shirt for a sophisticated summer look.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Shirts" },
      { name: "Oxford Button-Down Shirt", description: "Crisp oxford cotton shirt with button-down collar, a wardrobe essential.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Shirts" },
      { name: "Printed Casual Shirt", description: "Relaxed-fit printed shirt in breathable viscose fabric.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Shirts" },
      { name: "Tailored Chino Trousers", description: "Slim-fit chinos crafted from stretch-cotton twill for all-day comfort.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1624371414361-e67094c24944?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Trousers" },
      { name: "Formal Pleated Trousers", description: "Tailored pleated trousers in fine wool blend, ideal for the office.", price: "3499", imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Trousers" },
      { name: "Slim Fit Dark Wash Jeans", description: "Classic 5-pocket jeans in premium dark indigo denim with stretch.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jeans" },
      { name: "Relaxed Fit Light Jeans", description: "Comfortable relaxed-fit jeans in faded light wash denim.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jeans" },
      { name: "Leather Biker Jacket", description: "Genuine leather biker jacket with zip detailing and quilted shoulders.", price: "8999", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jackets" },
      { name: "Puffer Winter Jacket", description: "Warm padded puffer jacket with water-resistant shell and hood.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Jackets" },
      { name: "Cotton Kurta Set", description: "Traditional cotton kurta with embroidered neckline, paired with churidar.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Kurtas" },
      { name: "Silk Blend Kurta", description: "Festive silk blend kurta with intricate threadwork and mandarin collar.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Kurtas" },
      { name: "Two-Piece Formal Suit", description: "Slim-fit two-piece suit in premium worsted wool, fully lined.", price: "12999", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop", category: "Mens", subcategory: "Suits" },

      // Ladies - Western Wear
      { name: "Relaxed Fit Women's T-Shirt", description: "Soft cotton tee with a relaxed drop-shoulder fit, everyday essential.", price: "799", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "T-Shirts" },
      { name: "Printed V-Neck T-Shirt", description: "Trendy V-neck tee with abstract print in breathable cotton jersey.", price: "999", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "T-Shirts" },
      { name: "Ruffle Blouse Top", description: "Feminine ruffle blouse in lightweight chiffon with tie-neck detail.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Tops" },
      { name: "Cropped Knit Top", description: "Cropped ribbed knit top with short sleeves and fitted silhouette.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Tops" },
      { name: "Peplum Cami Top", description: "Elegant peplum cami top with adjustable straps and sweetheart neckline.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Tops" },
      { name: "Satin Wrap Dress", description: "Elegant satin wrap dress with a graceful drape, perfect for evening occasions.", price: "4599", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Dresses" },
      { name: "Floral Midi Dress", description: "Romantic floral print midi dress with puff sleeves and tiered skirt.", price: "3299", imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Dresses" },
      { name: "Bodycon Mini Dress", description: "Chic bodycon mini dress in ribbed knit with square neckline.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Dresses" },
      { name: "High-Rise Skinny Jeans", description: "Sculpting high-rise skinny jeans in power-stretch denim.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jeans" },
      { name: "Wide Leg Palazzo Jeans", description: "Trendy wide-leg palazzo jeans in light blue wash.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1475178626620-a4d074967571?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jeans" },
      { name: "Pleated Midi Skirt", description: "Elegant pleated midi skirt in satin finish with elastic waistband.", price: "2199", imageUrl: "https://images.unsplash.com/photo-1592301933927-35b597393c0a?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Skirts" },
      { name: "Denim Mini Skirt", description: "Classic denim mini skirt with raw hem and button-front closure.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1592301933927-35b597393c0a?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Skirts" },
      { name: "Cashmere Blend Cardigan", description: "Luxuriously soft cardigan featuring a relaxed silhouette and ribbed trims.", price: "3899", imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b49302194?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jackets" },
      { name: "Cropped Denim Jacket", description: "Classic cropped denim jacket with vintage wash and brass buttons.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Jackets" },
      { name: "Ribbed Cord Set", description: "Matching ribbed crop top and wide-leg trousers in soft jersey knit.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Cord Sets" },
      { name: "Linen Co-ord Set", description: "Breezy linen shirt and shorts co-ord set, perfect for summer outings.", price: "2799", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Cord Sets" },
      // Ladies - Indian Wear
      { name: "Embroidered Anarkali Kurta", description: "Gorgeous Anarkali kurta with intricate embroidery and flared silhouette.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurtas" },
      { name: "Cotton Printed Kurta", description: "Breezy cotton kurta with block print and notched neckline.", price: "1899", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurtas" },
      { name: "Straight Fit Rayon Kurta", description: "Elegant straight-fit kurta in flowy rayon with pintuck detailing.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurtas" },
      { name: "Mirror Work Kurta Set", description: "Festive kurta with mirror work paired with palazzo pants and dupatta.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurta Sets" },
      { name: "Cotton Kurta Pyjama Set", description: "Comfortable cotton kurta and pyjama set with contrast piping.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Kurta Sets" },
      { name: "Banarasi Silk Saree", description: "Luxurious Banarasi silk saree with gold zari work and rich pallu.", price: "8999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Sarees" },
      { name: "Printed Georgette Saree", description: "Lightweight georgette saree with contemporary print and satin border.", price: "3499", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Sarees" },
      { name: "Bridal Lehenga Choli", description: "Stunning bridal lehenga with heavy embroidery, sequins and dupatta.", price: "14999", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lehengas" },
      { name: "Flared Party Lehenga", description: "Vibrant flared lehenga with foil print and contrast choli.", price: "6999", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lehengas" },
      // Ladies - Sleepwear
      { name: "Satin Nightdress", description: "Luxurious satin nightdress with lace trim and adjustable straps.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Nightdresses" },
      { name: "Cotton Maxi Nightdress", description: "Breathable cotton maxi nightdress with delicate floral print.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Nightdresses" },
      { name: "Printed Pyjama Set", description: "Cute printed button-down shirt and pyjama set in soft cotton.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Pyjama Sets" },
      { name: "Satin Pyjama Set", description: "Elegant satin pyjama set with piping detail, smooth and comfortable.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Pyjama Sets" },
      // Ladies - Intimate Wear
      { name: "T-Shirt Bra", description: "Seamless padded T-shirt bra with smooth cups for everyday wear.", price: "899", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Bras" },
      { name: "Lace Underwire Bra", description: "Delicate lace underwire bra with adjustable straps and hook closure.", price: "1199", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Bras" },
      { name: "Lace Bralette & Brief Set", description: "Matching lace bralette and brief set in soft stretch fabric.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lingerie Sets" },
      { name: "Satin Cami & Shorts Set", description: "Luxurious satin cami and shorts lingerie set with lace edging.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop", category: "Ladies", subcategory: "Lingerie Sets" },

      { name: "Kids Dinosaur Print Tee", description: "Fun dinosaur graphic tee in soft cotton jersey for little explorers.", price: "599", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "T-Shirts" },
      { name: "Rainbow Stripe T-Shirt", description: "Cheerful rainbow striped tee in organic cotton, gentle on skin.", price: "699", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "T-Shirts" },
      { name: "Girls Floral Frock", description: "Adorable floral print frock with ruffled hem and bow detail.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Dresses" },
      { name: "Party Tulle Dress", description: "Sparkly tulle party dress with sequin bodice for special occasions.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Dresses" },
      { name: "Organic Cotton Kids Set", description: "Two-piece set made from soft organic cotton jersey for ultimate comfort.", price: "1599", imageUrl: "https://images.unsplash.com/photo-1621454523226-eb4045de3a05?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sets" },
      { name: "Dungaree & T-Shirt Set", description: "Classic denim dungaree set with matching striped tee.", price: "1899", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Sets" },
      { name: "Quilted Winter Jacket", description: "Lightweight yet warm quilted jacket with water-repellent finish.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Jackets" },
      { name: "Hooded Windbreaker", description: "Colourful hooded windbreaker with reflective strips for visibility.", price: "1799", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Jackets" },
      { name: "Cargo Shorts", description: "Durable cotton cargo shorts with adjustable waist and side pockets.", price: "899", imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Shorts" },
      { name: "Denim Shorts", description: "Comfortable stretch denim shorts with elastic waistband.", price: "799", imageUrl: "https://images.unsplash.com/photo-1519238263530-99abe11d5163?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Shorts" },
      { name: "Kids Kurta Pyjama Set", description: "Festive cotton kurta pyjama set with embroidered motifs.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Ethnic Wear" },
      { name: "Girls Lehenga Choli", description: "Adorable lehenga choli set with mirror work and dupatta.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?q=80&w=800&auto=format&fit=crop", category: "Kids", subcategory: "Ethnic Wear" },

      { name: "Minimalist Chronograph Watch", description: "Sleek stainless steel watch with minimalist dial and leather strap.", price: "7999", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Watches" },
      { name: "Rose Gold Digital Watch", description: "Modern rose gold digital watch with mesh band and date display.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Watches" },
      { name: "Leather Tote Bag", description: "Spacious genuine leather tote bag with inner zip pocket.", price: "5499", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Bags" },
      { name: "Canvas Crossbody Bag", description: "Casual canvas crossbody bag with adjustable strap and brass hardware.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Bags" },
      { name: "Reversible Leather Belt", description: "Premium reversible leather belt with polished buckle, black to brown.", price: "1499", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Belts" },
      { name: "Braided Canvas Belt", description: "Casual braided canvas belt with leather trim and metal buckle.", price: "799", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Belts" },
      { name: "Aviator Sunglasses", description: "Classic aviator sunglasses with UV400 protection and metal frame.", price: "2999", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Sunglasses" },
      { name: "Cat Eye Sunglasses", description: "Retro cat-eye sunglasses with gradient lenses and acetate frame.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Sunglasses" },
      { name: "Gold Layered Necklace", description: "Delicate gold-plated layered necklace with dainty pendants.", price: "1299", imageUrl: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c6?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Jewellery" },
      { name: "Silver Hoop Earrings", description: "Sterling silver hoop earrings with brushed finish, everyday elegance.", price: "899", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Jewellery" },
      { name: "Cashmere Wool Scarf", description: "Ultra-soft cashmere wool scarf in classic plaid pattern.", price: "3499", imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Scarves" },
      { name: "Silk Print Scarf", description: "Luxurious silk scarf with artistic floral print, versatile styling.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1601924921557-45e8e0e78e68?q=80&w=800&auto=format&fit=crop", category: "Accessories", subcategory: "Scarves" },

      { name: "White Canvas Sneakers", description: "Clean white canvas sneakers with cushioned insole and rubber outsole.", price: "2499", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sneakers" },
      { name: "Retro Running Sneakers", description: "Retro-inspired running sneakers with suede panels and mesh upper.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sneakers" },
      { name: "High-Top Sneakers", description: "Bold high-top sneakers in premium leather with contrast stitching.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sneakers" },
      { name: "Derby Formal Shoes", description: "Classic derby shoes in polished leather for formal occasions.", price: "5999", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Formal Shoes" },
      { name: "Cap-Toe Oxford Shoes", description: "Elegant cap-toe oxford shoes handcrafted from premium calfskin.", price: "7499", imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Formal Shoes" },
      { name: "Leather Slide Sandals", description: "Minimalist leather slide sandals with contoured cork footbed.", price: "1999", imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sandals" },
      { name: "Strappy Flat Sandals", description: "Elegant strappy sandals in soft leather with cushioned sole.", price: "2299", imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Sandals" },
      { name: "Block Heel Pumps", description: "Comfortable block heel pumps in suede with pointed toe.", price: "3999", imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Heels" },
      { name: "Stiletto Heels", description: "Sleek stiletto heels in patent leather for evening glamour.", price: "4499", imageUrl: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Heels" },
      { name: "Chelsea Ankle Boots", description: "Classic Chelsea boots in premium leather with elastic side panel.", price: "5999", imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Boots" },
      { name: "Combat Lace-Up Boots", description: "Rugged combat boots with thick sole and sturdy lace-up closure.", price: "4999", imageUrl: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Boots" },
      { name: "Handcrafted Leather Loafers", description: "Classic loafers made from premium Italian leather with a polished finish.", price: "5499", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Loafers" },
      { name: "Suede Tassel Loafers", description: "Refined suede loafers with tassel detail and flexible rubber sole.", price: "4299", imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop", category: "Footwear", subcategory: "Loafers" },
    ];

    for (const p of seedData) {
      await storage.createProduct(p);
    }
    console.log(`Database seeded with ${seedData.length} products`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
