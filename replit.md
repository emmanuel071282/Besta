# BESTA - Fast Fashion E-Commerce Storefront

## Overview
Fast-fashion e-commerce storefront for the Indian market, inspired by Primark/H&M/Zara. Features product browsing across 5 categories with prices in Indian Rupees (₹).

## Architecture
- **Frontend**: React + Vite, Wouter routing, TanStack Query, Zustand (cart & wishlist), Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL via Drizzle ORM
- **State Management**: Zustand with persistence for cart (`use-cart.ts`) and wishlist (`use-wishlist.ts`)

## Key Features
- Product browsing: Mens, Ladies, Kids, Accessories, Footwear categories
- Shopping cart (drawer UI, Zustand persist)
- Wishlist (heart toggle, Zustand persist)
- Checkout page with Indian payment options:
  - Card: Visa, Mastercard, RuPay
  - Net Banking: SBI, HDFC, ICICI, Axis, Kotak, PNB, BOB, Canara, Union, IDBI
  - UPI: Google Pay, Paytm, Amazon Pay, manual UPI ID

## Routes
- `/` - Home page (hero, categories, trending)
- `/category/:category` - Category listing
- `/product/:id` - Product detail
- `/wishlist` - Wishlist page
- `/checkout` - Checkout with payment options

## Design
- Brand: "BESTA" typography-only (bold, tracking-tighter)
- Minimalist black/white, rounded-none buttons, uppercase tracking-widest labels
- Currency: ₹ with `toLocaleString('en-IN')` formatting

## File Structure
- `shared/schema.ts` - Drizzle schema (products table)
- `server/routes.ts` - API routes
- `client/src/pages/` - Page components
- `client/src/components/` - Shared UI components
- `client/src/hooks/` - Custom hooks (use-cart, use-wishlist, use-products)
