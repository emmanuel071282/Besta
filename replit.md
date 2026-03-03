# BESTA - Fast Fashion E-Commerce Storefront

## Overview
Fast-fashion e-commerce storefront for the Indian market, inspired by Primark/H&M/Zara/Ajio/Myntra. Features product browsing across 5 categories with subcategories, prices in Indian Rupees (₹).

## Architecture
- **Frontend**: React + Vite, Wouter routing, TanStack Query, Zustand (cart & wishlist), Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL via Drizzle ORM
- **State Management**: Zustand with persistence for cart (`use-cart.ts`) and wishlist (`use-wishlist.ts`)

## Key Features
- Product browsing with subcategory filtering (85+ products total)
- Categories with subcategories:
  - **Mens**: T-Shirts, Shirts, Trousers, Jeans, Jackets, Kurtas, Suits
  - **Ladies** (grouped into sections):
    - *Western Wear*: T-Shirts, Tops, Dresses, Jeans, Skirts, Jackets, Cord Sets
    - *Indian Wear*: Kurtas, Kurta Sets, Sarees, Lehengas
    - *Sleepwear*: Nightdresses, Pyjama Sets
    - *Intimate Wear*: Bras, Lingerie Sets
  - **Kids**: T-Shirts, Dresses, Sets, Jackets, Shorts, Ethnic Wear
  - **Accessories**: Watches, Bags, Belts, Sunglasses, Jewellery, Scarves
  - **Footwear**: Sneakers, Formal Shoes, Sandals, Heels, Boots, Loafers
- Ladies uses grouped SubcategorySection[] type; other categories use flat string[]
- Schema helpers: `isGroupedSubcategories()`, `getAllSubcategories()` in shared/schema.ts
- Navbar with hover dropdown menus showing subcategories (desktop) and expandable accordion (mobile)
  - Ladies dropdown shows multi-column layout with section headers
  - Ladies mobile accordion shows section-grouped subcategories
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
