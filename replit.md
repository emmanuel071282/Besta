# BESTA - Fast Fashion E-Commerce Storefront

## Overview
Fast-fashion e-commerce storefront for the Indian market, inspired by Primark/H&M/Zara/Ajio/Myntra. Features product browsing across 5 categories with subcategories, prices in Indian Rupees (₹).

## Architecture
- **Frontend**: React + Vite, Wouter routing, TanStack Query, Zustand (cart & wishlist), Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL via Drizzle ORM
- **State Management**: Zustand with persistence for cart (`use-cart.ts`) and wishlist (`use-wishlist.ts`)

## Key Features
- Product browsing with subcategory filtering (126 products total)
- Categories with grouped sections (SubcategorySection[] type):
  - **Mens** (grouped):
    - *Casual Wear*: T-Shirts, Shirts, Trousers, Jeans, Jackets
    - *Ethnic Wear*: Kurtas, Sherwanis, Nehru Jackets
    - *Athleisure*: Joggers, Track Pants, Sports T-Shirts, Hoodies
    - *Accessories*: Watches, Belts, Wallets, Sunglasses
    - *Footwear*: Sneakers, Formal Shoes, Sandals, Loafers
  - **Ladies** (grouped):
    - *Western Wear*: T-Shirts, Tops, Dresses, Jeans, Skirts, Jackets, Cord Sets, Athleisure
    - *Indian Wear*: Kurtas, Kurta Sets, Sarees, Lehengas
    - *Sleepwear*: Nightdresses, Pyjama Sets
    - *Intimate Wear*: Bras, Lingerie Sets
    - *Footwear*: Heels, Flats, Sneakers, Sandals
  - **Kids** (grouped):
    - *Boys*: T-Shirts, Shirts, Jeans, Shorts, Jackets, Ethnic Wear
    - *Girls*: Dresses, Tops, Skirts, Leggings, Jackets, Ethnic Wear
    - *Infants*: Rompers, Onesies, Sets, Sleepsuits
    - *Footwear*: Sneakers, Sandals, School Shoes, Booties
  - **Accessories** (flat): Watches, Bags, Belts, Sunglasses, Jewellery, Scarves
  - **Footwear** (flat): Sneakers, Formal Shoes, Sandals, Heels, Boots, Loafers
- Mens, Ladies, Kids use grouped SubcategorySection[]; Accessories/Footwear use flat string[]
- Footwear is available both as a standalone category AND within Mens/Ladies/Kids sections
- Schema helpers: `isGroupedSubcategories()`, `getAllSubcategories()` in shared/schema.ts
- Navbar with hover dropdown menus showing subcategories (desktop) and expandable accordion (mobile)
  - Grouped categories show multi-column layout with section headers in dropdown
  - Mobile accordion shows section-grouped subcategories with headers
- Shopping cart (drawer UI, Zustand persist)
- Wishlist (heart toggle, Zustand persist)
- Checkout page with Indian payment options:
  - Card: Visa, Mastercard, RuPay
  - Net Banking: SBI, HDFC, ICICI, Axis, Kotak, PNB, BOB, Canara, Union, IDBI
  - UPI: Google Pay, Paytm, Amazon Pay, manual UPI ID

## Routes
- `/` - Home page (hero, categories, trending)
- `/category/:category` - Category listing with subcategory pill filters
- `/category/:category?sub=X` - Filtered by subcategory
- `/product/:id` - Product detail
- `/wishlist` - Wishlist page
- `/checkout` - Checkout with payment options
- `/exchange-policy` - Returns & Exchange policy (Ajio-style)

## Database Schema
- `products` table: id, name, description, price, imageUrl, category, subcategory
- Subcategory mapping defined in `shared/schema.ts` as `SUBCATEGORIES` constant

## Design
- Brand: "BESTA" typography-only (bold, tracking-tighter)
- Minimalist black/white, rounded-none buttons, uppercase tracking-widest labels
- Currency: ₹ with `toLocaleString('en-IN')` formatting

## File Structure
- `shared/schema.ts` - Drizzle schema (products table) + SUBCATEGORIES map
- `server/routes.ts` - API routes + seed data
- `server/storage.ts` - Database storage with subcategory filter support
- `client/src/pages/` - Page components (Home, CategoryPage, ProductPage, WishlistPage, CheckoutPage)
- `client/src/components/` - Shared UI components (Navbar, Footer, CartDrawer, ProductCard)
- `client/src/hooks/` - Custom hooks (use-cart, use-wishlist, use-products)
