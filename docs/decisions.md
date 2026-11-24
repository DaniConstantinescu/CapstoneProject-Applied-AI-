# E-Bookstore PoC – Decisions & Assumptions

This file records the requirement decisions agreed during review of [`documentation.md`](documentation.md) and the wireframes in [`photos/`](photos/). Where the wireframes and this file disagree, **this file wins**. The wireframes are a visual reference only.

## 1. Scope

| # | Decision |
|---|---|
| S1 | Physical books only (Paperback, Hardcover). No eBook format. |
| S2 | Single currency: EUR (€). The ₹ symbol, +91 and India-specific fields in the wireframes are ignored. |
| S3 | English only. No Language filter. |
| S4 | One user role (customer). No roles, entitlements or admin UI. One seeded demo user exists for convenience. |
| S5 | No stores, catalogues or store policies management. All data comes from seed data. |
| S6 | No returns and no return shipments. Cancellation only. |
| S7 | No coupons or discounts. The coupon field and discount line are removed from the cart. |
| S8 | No reviews, ratings, "copies sold", "My Writers", Bestsellers or New Launches sections. |
| S9 | No inventory management. Every book is always available, with no stock field. |
| S10 | No email sending. Confirmation is shown on screen only. |
| S11 | No password reset. |
| S12 | No pagination. |
| S13 | No API versioning (`/api/...`). A simple, consistent JSON error format is used. |

## 2. Authentication

| # | Decision |
|---|---|
| A1 | Registration (name, email, password) and login pages are in scope. Simple Carbon forms, no wireframe. |
| A2 | Email is unique. Minimum password length is 8. Passwords are hashed. |
| A3 | JWT stored in an httpOnly, SameSite=Lax cookie. Single access token with a fixed expiry (1 h). No refresh token. |
| A4 | **Guests can browse** the catalogue and product pages. Cart, wishlist, checkout and orders require login. A guest who opens the cart, wishlist or checkout is redirected to login. |
| A5 | A seeded demo user exists. It has no extra privileges. |

## 3. Catalogue

| # | Decision |
|---|---|
| C1 | Each book belongs to exactly **one category**. Categories are flat, with no subcategories. |
| C2 | "Brand" means **author**. Browse by author is supported. The publisher is shown as plain text only. |
| C3 | Seed data: about 8–10 categories, 30–40 books and about 10 authors. |
| C4 | Search is simple: case-insensitive match on title and author. |
| C5 | Sort options are predefined and fixed: Relevance (default, seed order), Price low→high, Price high→low, Title A–Z. |
| C6 | Filters: category and author. Format and Price Range filters are not included. |
| C7 | Related books are books in the **same category**, excluding the current book, capped at 4. This also serves as the upsell/cross-sell feature. |
| C8 | Recommended for You: categories of previously purchased books, excluding books already bought, up to 10 books. For a user with no history (or a guest), show the first 10 books in the seed order. |
| C9 | Estimated delivery date = today + a constant number of days (default 5), set in config. It is the same for every book and not dependent on address. |
| C10 | Breadcrumb: Home / Category / Book. |

## 4. Wishlist

| # | Decision |
|---|---|
| W1 | Per-user wishlist stored in the DB. |
| W2 | Add, remove and move to cart. Login required. |

## 5. Cart and checkout

| # | Decision |
|---|---|
| K1 | The cart is stored server-side and requires login. |
| K2 | Cart and checkout are **one screen**, as in the wireframe: items, quantity steppers, address form, totals and Pay Now. |
| K3 | No maximum quantity. Reducing the quantity to 0 removes the item. |
| K4 | Tax is a constant percentage and is **included** in the price. The total is the sum of item prices, plus shipping. The UI shows an "Includes €X tax" line. |
| K5 | Shipping is a constant flat cost from config (default: free). |
| K6 | The backend computes all totals. The frontend never calculates them. |
| K7 | No address book and no "Use saved address". The address is entered at checkout and stored as a **snapshot on the order**. |
| K8 | Address fields, all required: first name, last name, phone, address (single line), city, postal code, state, country. Only basic format validation. |

## 6. Payment

| # | Decision |
|---|---|
| P1 | Internal mock only: a UI and one backend API call. The mock accepts any input and always succeeds. There is no failure path. |
| P2 | Payment UI offers Credit Card and Debit Card. UPI and Wallet are removed. |
| P3 | Card details are never stored. The order stores only the payment method and the payment status. |
| P4 | Payment statuses: `paid`, `refunded`. |

## 7. Orders

| # | Decision |
|---|---|
| O1 | Confirmation screen as in the wireframe: success message, purchased items and Continue Shopping. |
| O2 | The order status is **derived from time since confirmation**. Only cancellation is stored. |
| O3 | Order detail has its own page: items, address, totals, status and Cancel button. |
| O4 | Cancellation applies to the whole order (no partial cancellation). It is allowed within 48 hours of confirmation and only while the order is `Confirmed`. It sets the order to `Cancelled` and the payment to `refunded` (simulated). |
| O5 | Buy Again adds the items of a previous order to the cart at their original quantity. If an item is already in the cart, its quantity is incremented. |

Order status model:

| Time since confirmation | Order status | Cancellable |
|---|---|---|
| 0–48 h | Confirmed | Yes |
| After 48 h until the estimated delivery date | Shipped | No |
| After the estimated delivery date | Delivered | No |
| Cancelled by user | Cancelled (payment refunded) | No |

## 8. Technology

| # | Decision |
|---|---|
| T1 | Monorepo with `backend/` and `frontend/` as independent packages. |
| T2 | Database access with plain `pg` (node-postgres). No ORM. |
| T3 | Dark theme only (Carbon g100). Responsive using the Carbon grid breakpoints. |
| T4 | Tests use Vitest for backend and frontend. Supertest is used for API tests and React Testing Library for components. No E2E tests and no coverage target. Core flows are covered: auth, cart, checkout, cancellation, recommendations. |
| T5 | Local run only. No Docker and no deployment. PostgreSQL is assumed to be available locally, with migration and seed scripts. |

## 9. Open points

- None blocking. Revisit once the OpenAPI spec and data model are drafted.
