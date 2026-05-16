# BESTA - Omni-Channel Fast Fashion E-Commerce Platform

## Overview
Full omni-channel fast-fashion e-commerce platform for the Indian market. Features product browsing, cart, wishlist, checkout with Indian payment options, user accounts, admin dashboard with sales reports, and multi-store inventory management across retail outlets in India. All prices in ₹.

## Architecture
- **Frontend**: React + Vite, Wouter routing, TanStack Query, Zustand (cart & wishlist), Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL via Drizzle ORM, express-session + connect-pg-simple
- **State Management**: Zustand with persistence for cart (`use-cart.ts`) and wishlist (`use-wishlist.ts`)

## Key Features
- 124 products across 5 categories with grouped subcategories
- Shopping cart (drawer UI), wishlist (heart toggle)
- User accounts: registration (mobile + 4-digit PIN), OTP-based login via Twilio WhatsApp, sessions
- Checkout with shipping address form + Indian payment options (Card, Net Banking, UPI)
- Order placement via API (POST /api/orders), order history, order detail with status tracking
- Exchange & Returns policy page
- Best Sellers section on home page
- **Admin Dashboard**: stats overview, recent orders
- **Admin Orders**: list with status tabs, expandable rows, inline status update
- **Admin Sales Reports**: bar chart, top products, date range selector (7/30/90 days)
- **Admin Stores**: add/edit/toggle 10 retail outlets across India
- **Admin Inventory**: omni-channel stock management, inline qty editing, low stock alerts, filter by store

## Hello Summer — Summer ’26 Range Push
- Admin-toggleable campaign system powers a header strip, hero banner, popup, /summer landing, account referral card and WhatsApp re-engagement blast.
- Messaging is **range-led, not discount-led** — in-app surfaces communicate "Hello Summer / The new Summer ’26 range has landed" with no % off on the page.
- Default campaign: slug `summer-2026`, CTA `Explore The Range`, 60-day window. A silent promo code (`BESTASUMMER`, 15% off ≥ ₹999) is kept for checkout/referral deep-links and is only revealed once the customer enters it at checkout — never advertised in banners/popups.
- Manage at `/admin/campaigns` (create / edit / activate / WhatsApp blast).
- Marketing asset pack in `client/public/marketing/summer/` (5× 1:1 SVG, 2× 9:16 SVG, `copy.md`, `one-pager.html`).
- ASO refresh (title, descriptions, keywords, screenshot spec) lives in `MOBILE_BUILD_GUIDE.md`.

## Routes

### Storefront
- `/` - Home (hero, summer banner, categories, best sellers)
- `/summer` - Summer ’26 landing (hero, quick tiles, best sellers, CTA)
- `/category/:category` - Category listing with subcategory filters
- `/category/:category?sub=X` - Filtered by subcategory
- `/product/:id` - Product detail
- `/wishlist` - Wishlist page
- `/checkout` - Shipping + payment checkout (2-step)
- `/exchange-policy` - Returns & Exchange policy
- `/login` - Sign in (mobile + PIN)
- `/register` - Create account
- `/account` - Profile, My Orders link, Admin Panel link (admin only)
- `/orders` - Customer order history
- `/orders/:id` - Order detail with status tracking

### Admin (requires role=admin)
- `/admin` - Dashboard (stats + recent orders)
- `/admin/orders` - Order management (status tabs, detail expand, status update)
- `/admin/sales` - Sales report (bar chart, top products)
- `/admin/stores` - Store management (CRUD, activate/deactivate)
- `/admin/inventory` - Inventory management (inline edit, low stock alerts)
- `/admin/campaigns` - Campaign management (promo code, in-app surfaces, WhatsApp blast)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (legacy PIN-based, kept as fallback)
- `POST /api/auth/send-otp` - Send OTP via Twilio WhatsApp (falls back to simulated mode if Twilio not configured)
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - All products
- `GET /api/products/category/:category` - By category (optional ?subcategory=)

### Campaigns
- `GET /api/campaigns/active` - Currently active campaign (or null)
- `GET /api/campaigns/validate?code=&subtotal=` - Validate promo + compute discount
- `GET /api/admin/campaigns` - List all campaigns (admin)
- `POST /api/admin/campaigns` - Create campaign (admin)
- `PATCH /api/admin/campaigns/:id` - Update / toggle (admin)
- `POST /api/admin/campaigns/:id/blast` - WhatsApp blast to opted-in users (admin)

### Customer Orders
- `POST /api/orders` - Place order (requires auth, accepts optional `promoCode`)
- `GET /api/orders` - User's order history
- `GET /api/orders/:id` - Order detail with items

### Admin (requires admin role)
- `GET /api/admin/dashboard` - Stats (totalOrders, totalRevenue, totalProducts, activeStores)
- `GET /api/admin/orders` - All orders (optional ?status=)
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/orders/:id/items` - Order items
- `GET /api/admin/sales?days=30` - Sales report + top products
- `GET /api/admin/stores` - All stores
- `POST /api/admin/stores` - Create store
- `PATCH /api/admin/stores/:id` - Update store
- `GET /api/admin/inventory` - Inventory (optional ?storeId=&productId=)
- `PATCH /api/admin/inventory/:id` - Update inventory quantity
- `POST /api/admin/inventory` - Add/upsert inventory

## Database Schema
- `products` - id, name, description, price, imageUrl, category, subcategory, sizes (text array)
- `users` - id, name, mobile (unique), email, pin (bcrypt), birthday, role (customer/admin)
- `stores` - id, name, city, state, pincode, address, phone, isActive
- `inventory` - id, productId, storeId, quantity, reservedQty
- `campaigns` - id, slug, title, subtitle, eyebrow, ctaLabel, ctaLink, heroImageUrl, promoCode, discountType (percent/flat/shipping), discountValue, minOrder, startDate, endDate, isActive
- `users` - … + `marketingOptIn` (boolean, used by WhatsApp blast targeting)
- `orders` - id, userId, orderNumber (unique), status, totalAmount, shipping fields, paymentMethod, promoCode, discountAmount, createdAt
- `order_items` - id, orderId, productId, storeId, quantity, price
- `session` - managed by connect-pg-simple

## Admin Credentials
- Mobile: `9999999999`, PIN: `0000`, Role: `admin`

## Categories & Subcategories
- **Mens** (grouped): Casual Wear, Ethnic Wear, Athleisure, Accessories, Footwear
- **Ladies** (grouped): Western Wear, Indian Wear, Sleepwear, Intimate Wear, Footwear
- **Kids** (grouped): Boys, Girls, Infants, Footwear
- **Accessories** (flat): Watches, Bags, Belts, Sunglasses, Jewellery, Scarves
- **Footwear** (flat): Sneakers, Formal Shoes, Sandals, Heels, Boots, Loafers

## Per-Category Size Selection
- `SIZE_CHART` in `shared/schema.ts` maps category/subcategory → size arrays
- Mens clothing: S, M, L, XL, XXL; Mens footwear: UK 6-11
- Ladies clothing: XS, S, M, L, XL; Ladies footwear: UK 3-8; Bras: band/cup sizes
- Kids clothing: age groups (2-3Y to 12-13Y); Infants: 0-3M to 9-12M; Kids footwear: UK 8C-3
- Accessories: Free Size (auto-added, no selector shown)
- Cart key = `productId + selectedSize` (same product in different sizes = separate items)
- `getSizesForProduct(category, subcategory)` helper auto-assigns sizes

## Design
- Brand: "BESTA" typography-only (bold, tracking-tighter)
- Minimalist black/white, rounded-none buttons, uppercase tracking-widest labels
- Currency: ₹ with `toLocaleString('en-IN')` formatting
- **Visual Consistency Standards** (all customer-facing pages):
  - Page shell: `min-h-screen bg-background pt-28 pb-20`
  - Page headings: `font-display font-bold tracking-tighter uppercase`
  - CTA buttons/links: `py-3.5 text-xs uppercase tracking-widest font-semibold`
  - Loading/error/empty states use same shell classes as main content
  - Fonts: DM Sans (body), Outfit (display/headings)

## Mobile App (Capacitor)
- **App ID**: `in.besta.app`
- **Framework**: Capacitor (wraps web app into native Android/iOS)
- **Config**: `capacitor.config.ts`
- **Build Guide**: `MOBILE_BUILD_GUIDE.md` — step-by-step instructions for building and publishing to Google Play & App Store
- **Web Manifest**: `client/public/manifest.json` — PWA manifest with app icons
- **Icons**: `client/public/icons/` — SVG icons (replace with PNG for production)
- **Build flow**: `npm run build` → `npx cap sync` → `npx cap open android/ios`

## File Structure
- `shared/schema.ts` - Drizzle schema + SUBCATEGORIES map + helpers
- `server/routes.ts` - API routes + seed data (products, stores, admin user, inventory)
- `server/storage.ts` - Database storage layer (all CRUD + analytics)
- `client/src/pages/` - Storefront pages
- `client/src/pages/admin/` - Admin pages (AdminLayout, DashboardPage, OrdersPage, SalesPage, StoresPage, InventoryPage)
- `client/src/components/` - Shared UI (Navbar, Footer, CartDrawer, ProductCard)
- `client/src/hooks/` - Custom hooks (use-cart, use-wishlist, use-products, use-auth)
- `capacitor.config.ts` - Capacitor native app configuration
- `MOBILE_BUILD_GUIDE.md` - Complete Android & iOS build/publish instructions
