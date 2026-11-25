# E-Bookstore Proof of Concept (PoC) – Implementation Plan

## Top-Level Overview

This plan outlines the end-to-end implementation of the physical e-bookstore PoC ("Book Worm") based on `docs/requirements.md`, `docs/decisions.md`, and `docs/technical-design.md`.

The system consists of:
1. **Backend**: Express.js with TypeScript, node-postgres (`pg`) for direct SQL queries without ORM, JWT authentication stored in httpOnly cookies, Zod validation, and Vitest + Supertest testing.
2. **Database**: PostgreSQL with SQL schema migrations and seed data for ~10 categories, ~10 authors, ~30–40 physical books, and 1 demo user.
3. **Frontend**: Next.js (App Router) with TypeScript, IBM Carbon Design System (dark theme `g100`), Next.js URL rewrite proxy for `/api/*` to the backend, and Vitest + React Testing Library for testing.

---

## Sub-Tasks

### Sub-Task 1: OpenAPI 3.0 Specification
- **Intent**: Establish the formal API contract between backend and frontend as specified in technical design.
- **Expected Outcomes**:
  - `docs/openapi.yaml` created containing complete endpoint definitions, request/response DTOs, query parameters, and error schemas.
- **Todo List**:
  1. Define OpenAPI 3.0 document metadata, tags, and security schemes (cookie auth `token`).
  2. Specify Auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
  3. Specify Catalogue & Recommendation endpoints (`/api/categories`, `/api/authors`, `/api/books`, `/api/books/{id}`, `/api/books/{id}/related`, `/api/recommendations`).
  4. Specify Cart endpoints (`/api/cart`, `/api/cart/items`, `/api/cart/items/{bookId}`).
  5. Specify Wishlist endpoints (`/api/wishlist`, `/api/wishlist/items`, `/api/wishlist/items/{bookId}`, `/api/wishlist/items/{bookId}/move-to-cart`).
  6. Specify Order endpoints (`/api/orders`, `/api/orders/{id}`, `/api/orders/{id}/cancel`, `/api/orders/{id}/buy-again`).
  7. Specify reusable component schemas, error structures, and response codes.
- **Relevant Context**: `docs/technical-design.md` (Section 7), `docs/decisions.md` (S13, A1-A4, C4-C9, W1-W2, K1-K8, P1-P4, O1-O5).
- **Status**: `[x] done`

---

### Sub-Task 2: Backend Scaffolding, Database Setup & Migrations
- **Intent**: Set up the backend package structure, TypeScript configuration, PostgreSQL database connection pool, migration runner, initial schema, seed dataset, and reset utilities.
- **Expected Outcomes**:
  - `backend/` initialized with `package.json`, `tsconfig.json`, `vitest.config.ts`, `.env.example`.
  - Migration script applying `001_init.sql` to PostgreSQL (`schema_migrations` table tracking).
  - Seed script inserting categories, authors, books, and demo user (`demo@bookworm.local` / `demo12345`).
  - Reset script to drop, migrate, and seed.
- **Todo List**:
  1. Create `backend/package.json` with required dependencies (`express`, `pg`, `zod`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `dotenv`, and devDependencies `typescript`, `vitest`, `supertest`, `@types/*`, `tsx`).
  2. Set up `backend/tsconfig.json` and `backend/vitest.config.ts`.
  3. Create `backend/src/config.ts` loading and validating environment variables (`PORT`, `DATABASE_URL`, `TEST_DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `DELIVERY_DAYS`, `SHIPPING_COST_CENTS`, `TAX_RATE`, `CANCELLATION_WINDOW_HOURS`).
  4. Create `backend/src/db.ts` managing `pg.Pool` and transaction helpers (`withTransaction`).
  5. Implement `backend/db/migrations/001_init.sql` based on technical design DDL (users, categories, authors, books, cart_items, wishlist_items, orders, order_items).
  6. Implement migration runner `backend/scripts/migrate.ts`.
  7. Implement seed data generator and runner `backend/scripts/seed.ts` containing realistic book titles, descriptions, categories, authors, and cover image paths.
  8. Implement `backend/scripts/reset.ts` and add npm scripts `db:migrate`, `db:seed`, `db:reset`.
- **Relevant Context**: `docs/technical-design.md` (Sections 2, 3, 4), `docs/decisions.md` (T1, T2, T5, C3, A5).
- **Status**: `[x] done`

---

### Sub-Task 3: Backend Core Utilities, Middleware & Pure Domain Logic
- **Intent**: Implement error handling, Zod validation middleware, JWT authentication middlewares, and pure calculation logic for pricing and order status derivation.
- **Expected Outcomes**:
  - `pricing.ts` computing items total, included tax, shipping, and grand total.
  - `orderStatus.ts` deriving `Confirmed`, `Shipped`, `Delivered`, `Cancelled` status and `cancellable` flag.
  - `errors.ts` and `errorHandler.ts` formatting standard error responses (`VALIDATION_ERROR`, `NOT_FOUND`, etc.).
  - `validate.ts` middleware checking request params, query, and body against Zod schemas.
  - `auth.ts` middleware providing `requireAuth` and `optionalAuth` extracting user ID from `token` cookie.
  - Unit tests verifying pure calculation logic and status derivation boundaries.
- **Todo List**:
  1. Implement `backend/src/lib/errors.ts` with custom domain errors (e.g. `AppError`, `NotFoundError`, `ConflictError`, `ValidationError`, `UnauthorizedError`).
  2. Implement `backend/src/lib/pricing.ts` calculation logic according to section 5.1.
  3. Implement `backend/src/lib/orderStatus.ts` pure function according to section 5.3.
  4. Implement `backend/src/middleware/errorHandler.ts` to return uniform `{ error: { code, message, details? } }`.
  5. Implement `backend/src/middleware/validate.ts` wrapper for Zod schemas.
  6. Implement `backend/src/middleware/auth.ts` (`requireAuth`, `optionalAuth`) using `jsonwebtoken` and `cookie-parser`.
  7. Write unit tests in `backend/src/lib/pricing.test.ts` and `backend/src/lib/orderStatus.test.ts`.
- **Relevant Context**: `docs/technical-design.md` (Sections 5.1, 5.2, 5.3, 6, 7.1), `docs/decisions.md` (K4, K5, K6, O2, O4).
- **Status**: `[x] done`

---

### Sub-Task 4: Backend Authentication & Catalogue Modules
- **Intent**: Implement and test public and authenticated APIs for user registration/login and catalogue browsing/searching.
- **Expected Outcomes**:
  - Auth module (`routes.ts`, `service.ts`, `repository.ts`, `schemas.ts`) supporting register with auto-login, login, logout, and get current user (`/api/auth/me`).
  - Catalogue module supporting category list, author list, book list with search/category/author/sort query filters, book detail with author bio and wishlist status, related books (same category, max 4), and recommendations (order history-based with fallback).
  - Supertest API integration tests covering all auth and catalogue scenarios.
- **Todo List**:
  1. Create Express application factory in `backend/src/app.ts` with cookie-parser, json body parser, and route registration.
  2. Implement Auth module (`backend/src/modules/auth/*`) with password hashing via `bcryptjs`, JWT cookie generation, and unique email validation.
  3. Implement Catalogue module (`backend/src/modules/catalogue/*`) with repository queries for books, categories, authors, search (`ILIKE` with wildcards escaped), category/author filtering, and sort orders.
  4. Implement Recommendations module (`backend/src/modules/recommendations/*`) executing recommendation query (section 5.9) with fallback to seed order.
  5. Write API integration tests (`auth.test.ts`, `catalogue.test.ts`, `recommendations.test.ts`).
- **Relevant Context**: `docs/technical-design.md` (Sections 5.7, 5.8, 5.9, 6, 7.2), `docs/decisions.md` (A1-A5, C1-C8).
- **Status**: `[x] done`

---

### Sub-Task 5: Backend Cart, Wishlist & Orders Modules
- **Intent**: Implement and test shopping cart, wishlist, and order management endpoints including checkout transaction, cancellation, and buy-again logic.
- **Expected Outcomes**:
  - Cart module supporting retrieval, adding items (upsert), updating quantities (0 deletes), and calculation of totals.
  - Wishlist module supporting add, remove, and atomic move-to-cart.
  - Orders module supporting checkout transaction (read cart -> lock -> compute totals -> insert order & items snapshot -> clear cart), order history, order details, 48-hour atomic cancellation, and buy-again replenishment.
  - Comprehensive API integration tests for cart, wishlist, and checkout lifecycle.
- **Todo List**:
  1. Implement Cart module (`backend/src/modules/cart/*`) with DB queries on `cart_items` joined with `books`, formatting response via `pricing.ts`.
  2. Implement Wishlist module (`backend/src/modules/wishlist/*`) with add, remove, and transactional `move-to-cart`.
  3. Implement Orders module (`backend/src/modules/orders/*`) with atomic checkout transaction (section 5.4), atomic cancellation query (section 5.5), and buy-again query (section 5.6).
  4. Mount all routers in `backend/src/app.ts` and set up server entrypoint in `backend/src/server.ts`.
  5. Write API tests (`cart.test.ts`, `wishlist.test.ts`, `orders.test.ts`) validating checkout validation, empty cart 409, cancellation window limits, and buy-again mechanics.
- **Relevant Context**: `docs/technical-design.md` (Sections 5.4, 5.5, 5.6, 7.2), `docs/decisions.md` (W1-W2, K1-K8, P1-P4, O1-O5).
- **Status**: `[x] done`

---

### Sub-Task 6: Frontend Scaffolding, Carbon Theme & API Client
- **Intent**: Initialize Next.js frontend with IBM Carbon Design System, dark theme `g100`, API rewrite proxy, typed HTTP client, global state contexts, and formatting utilities.
- **Expected Outcomes**:
  - Next.js application in `frontend/` with Sass configured for Carbon `g100` dark theme.
  - `next.config.mjs` configured to rewrite `/api/:path*` to `BACKEND_URL` (`http://localhost:4000/api/:path*`).
  - Typed API client in `frontend/src/lib/api.ts` with error handling, credentials, and 401 redirection.
  - Formatters in `frontend/src/lib/formatters.ts` for EUR currency and delivery dates.
  - `AuthContext` and `CartContext` for managing authenticated user state and cart badge count.
  - Placeholder book cover images created in `frontend/public/covers/`.
- **Todo List**:
  1. Scaffold `frontend/package.json` with Next.js, React, `@carbon/react`, `@carbon/icons-react`, `sass`, and Vitest testing dependencies.
  2. Configure `frontend/next.config.mjs` with `/api/*` rewrites to backend.
  3. Set up Carbon theme styles in `frontend/src/styles/globals.scss` importing `@carbon/styles` with `$carbon--theme: $g100`.
  4. Implement `frontend/src/lib/types.ts` defining TypeScript types matching backend DTOs.
  5. Implement `frontend/src/lib/formatters.ts` (`formatPrice(cents)`, `formatDate(dateStr)`).
  6. Implement `frontend/src/lib/api.ts` supporting `get`, `post`, `put`, `del` with structured `ApiError`.
  7. Implement `frontend/src/context/AuthContext.tsx` and `frontend/src/context/CartContext.tsx`.
  8. Create placeholder cover images in `frontend/public/covers/` matching the seeded book records.
- **Relevant Context**: `docs/technical-design.md` (Sections 1, 2, 8.9), `docs/decisions.md` (T1, T3, S2).
- **Status**: `[x] done`

---

### Sub-Task 7: Frontend Authentication, Navigation & Route Protection
- **Intent**: Build the global application shell including Header with user menu and cart badge, Login/Register pages, and Next.js middleware for route protection.
- **Expected Outcomes**:
  - Top header with logo ("Book Worm"), navigation links (My Orders, My Wishlist), cart icon with live badge, and user menu / login link.
  - `/login` and `/register` pages built with Carbon components (TextInput, PasswordInput, Button, InlineNotification).
  - `frontend/src/middleware.ts` redirecting unauthenticated guests away from protected routes (`/cart`, `/wishlist`, `/orders/**`) with `next` query parameter.
- **Todo List**:
  1. Implement root layout in `frontend/src/app/layout.tsx` wrapping the application in Carbon `<Theme theme="g100">`, `AuthProvider`, and `CartProvider`.
  2. Implement `Header` component in `frontend/src/components/Header.tsx` using `@carbon/react` header components.
  3. Implement Next.js route protection in `frontend/src/middleware.ts` checking `token` cookie.
  4. Implement `frontend/src/app/login/page.tsx` with login form, validation error display, and redirect logic.
  5. Implement `frontend/src/app/register/page.tsx` with registration form, auto-login, and redirect logic.
- **Relevant Context**: `docs/technical-design.md` (Sections 6, 8.1, 8.2), `docs/decisions.md` (A1, A4).
- **Status**: `[x] done`

---

### Sub-Task 8: Frontend Catalogue & Product Details Pages
- **Intent**: Implement the main shopping discovery experience including the catalogue home page with filtering/sorting and the product detail page with related reads.
- **Expected Outcomes**:
  - `/` home page with category sidebar, search input, author dropdown, sort selector, "Recommended for You" row (when unfiltered), and responsive BookGrid.
  - `/books/[id]` product detail page showing book metadata, author bio & photo, format, price, delivery date, Add to Cart, Wishlist toggle, and Related Reads (max 4).
- **Todo List**:
  1. Implement `BookCard` component displaying cover, title, author link, category tag, price in EUR, and estimated delivery date.
  2. Implement `BookGrid` and `RecommendedSection` components.
  3. Implement Catalogue Home page (`frontend/src/app/page.tsx`) managing URL search params (`categoryId`, `authorId`, `q`, `sort`).
  4. Implement Product Detail page (`frontend/src/app/books/[id]/page.tsx`) with breadcrumb `Home / <Category> / <Title>`, "About the writer" section, Add to Cart action, Wishlist toggle button, and "Related Reads" sidebar.
  5. Add unit tests for `BookCard` and catalogue formatting.
- **Relevant Context**: `docs/technical-design.md` (Sections 8.3, 8.4), `docs/decisions.md` (C1-C10, W2).
- **Status**: `[x] done`

---

### Sub-Task 9: Frontend Shopping Cart, Checkout & Payment Dialog
- **Intent**: Build the single-screen Cart & Checkout page (`/cart`), item quantity steppers, shipping address form, tax calculation display, and the simulated Payment Dialog modal.
- **Expected Outcomes**:
  - `/cart` displaying cart items with `QuantityStepper` (0 removes item), empty cart view, 8-field shipping address form, and order summary totals ("Includes €X tax", "Delivery charges: Free").
  - "Pay Now" button validating address and opening the Carbon modal `PaymentDialog` (Credit Card / Debit Card tabs).
  - Submitting payment triggers checkout API call and redirects to `/orders/[id]/confirmation`.
  - `/orders/[id]/confirmation` page displaying purchase success message, purchased items list, and "Continue your Shopping" button.
- **Todo List**:
  1. Implement `QuantityStepper` component with increment/decrement handlers.
  2. Implement `CartItemRow` component.
  3. Implement `AddressForm` component with validation for the 8 required address fields.
  4. Implement `OrderSummary` breakdown component displaying items total, included tax, shipping cost, and grand total.
  5. Implement `PaymentDialog` modal component featuring Credit Card and Debit Card tabs, mock input fields, and pay trigger.
  6. Assemble `/cart` page (`frontend/src/app/cart/page.tsx`).
  7. Implement `/orders/[id]/confirmation/page.tsx` displaying purchase confirmation and ordered books.
  8. Write component tests for `QuantityStepper`, `AddressForm`, and `PaymentDialog`.
- **Relevant Context**: `docs/technical-design.md` (Sections 8.5, 8.6, 8.7), `docs/decisions.md` (K1-K8, P1-P4, O1).
- **Status**: `[x] done`

---

### Sub-Task 10: Frontend Orders Management & Wishlist Pages
- **Intent**: Implement order history browsing with Buy Again, order details with derived status tracking and 48-hour cancellation modal, and the user wishlist page.
- **Expected Outcomes**:
  - `/orders` listing past orders with order number, date, status tag (Confirmed/Shipped/Delivered/Cancelled), item thumbnails, View button, and Buy Again button.
  - `/orders/[id]` order detail page displaying full address snapshot, price breakdown, status tag, estimated delivery date, and Cancel Order button (with confirmation modal) enabled only when cancellable.
  - `/wishlist` page listing saved books with Remove and "Move to Cart" actions.
- **Todo List**:
  1. Implement Order status tag styling helper mapping status to Carbon Tag colours (`Confirmed` blue, `Shipped` purple, `Delivered` green, `Cancelled` gray).
  2. Implement Order History page (`frontend/src/app/orders/page.tsx`) with "Buy Again" action calling API and redirecting to `/cart`.
  3. Implement Order Detail page (`frontend/src/app/orders/[id]/page.tsx`) with order cancellation confirmation modal.
  4. Implement Wishlist page (`frontend/src/app/wishlist/page.tsx`) with remove and "Move to Cart" buttons.
  5. Add component tests for Order status rendering and cancellation modal.
- **Relevant Context**: `docs/technical-design.md` (Sections 8.8, 5.3, 5.5, 5.6), `docs/decisions.md` (O2-O5, W1-W2).
- **Status**: `[x] done`

---

### Sub-Task 11: End-to-End Integration, Verification & Documentation
- **Intent**: Verify complete backend and frontend test suites, test the end-to-end user journeys locally, ensure consistent styling, and document startup/running instructions.
- **Expected Outcomes**:
  - All backend Vitest API & unit tests passing.
  - All frontend Vitest component tests passing.
  - Complete `README.md` providing step-by-step setup, database creation, migration, seed, backend run, and frontend run commands.
  - Clean build in both `backend/` (`npm run build`) and `frontend/` (`npm run build`).
- **Todo List**:
  1. Execute full backend test suite (`npm run test` in `backend/`).
  2. Execute full frontend test suite (`npm run test` in `frontend/`).
  3. Perform production build check in both packages (`npm run build`).
  4. Write root `README.md` with prerequisites (Node.js, PostgreSQL), setup instructions (`npm install`, `db:migrate`, `db:seed`), and run commands (`npm run dev` in backend and frontend).
  5. Validate full end-to-end flow: guest browsing -> register -> catalogue search & filter -> add to cart -> checkout with mock card -> confirmation -> view order -> cancel order -> buy again -> wishlist.
- **Relevant Context**: `docs/technical-design.md` (Sections 9, 10), `docs/decisions.md` (T4, T5).
- **Status**: `[x] done`
