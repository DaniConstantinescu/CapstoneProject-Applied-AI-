# Book Worm – E-Bookstore Platform (PoC)

Proof of Concept (PoC) for a physical e-commerce bookstore platform built with **Next.js (IBM Carbon Design System g100 dark theme)**, **Express.js with TypeScript**, and **PostgreSQL (plain `pg`, no ORM)**.

---

## Architecture Overview

- **Frontend (`frontend/`)**: Next.js 14 (App Router) with `@carbon/react` (g100 theme). Next.js URL rewrites proxy `/api/*` requests to the backend, enabling seamless same-origin cookie authentication.
- **Backend (`backend/`)**: Express.js with TypeScript, `pg` connection pool with transaction support, Zod validation, bcryptjs password hashing, and JWT tokens stored in `httpOnly` `SameSite=Lax` cookies.
- **Database**: PostgreSQL with plain SQL migration runner and deterministic seed data (10 categories, 10 authors, 32 physical books, and 1 demo user).
- **Testing**: Vitest across both packages with Supertest for API integration testing and React Testing Library for React component testing.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+
- **PostgreSQL**: Local PostgreSQL instance running on port `5432`

---

## Getting Started

### 1. Database Setup

Ensure PostgreSQL is running and create the databases (if not already created):

```bash
createdb bookworm
createdb bookworm_test
```

### 2. Backend Setup & Seeding

```bash
cd backend
npm install
npm run db:reset    # Drops existing tables, runs migrations, and seeds the database
```

To run the backend development server (starts on `http://localhost:4000`):

```bash
npm run dev
```

### 3. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev         # Starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

- **Email**: `demo@bookworm.local`
- **Password**: `demo12345`

*(You can also register a new account on `/register` or click "Fill Demo Credentials" on `/login`.)*

---

## Running Tests

### Backend Tests (44 unit and API integration tests)

```bash
cd backend
npm test
```

### Frontend Tests (13 unit and component tests)

```bash
cd frontend
npm test
```

---

## Building for Production

### Backend Build

```bash
cd backend
npm run build
```

### Frontend Build

```bash
cd frontend
npm run build
```

---

## Project Structure

```text
/
├── docs/
│   ├── requirements.md          # Business use cases and constraints
│   ├── decisions.md             # Resolved design decisions
│   ├── technical-design.md      # Architecture, data model & API specification
│   ├── openapi.yaml             # Complete OpenAPI 3.0 REST contract
│   └── photos/                  # Wireframes
├── backend/
│   ├── db/migrations/           # 001_init.sql
│   ├── scripts/                 # migrate.ts, seed.ts, reset.ts
│   └── src/
│       ├── app.ts               # Express application factory
│       ├── server.ts            # Entrypoint listener
│       ├── config.ts            # Typed env configuration
│       ├── db.ts                # pg.Pool and transaction runner
│       ├── middleware/          # auth, validate, errorHandler
│       ├── modules/             # auth, catalogue, recommendations, cart, wishlist, orders
│       └── lib/                 # pricing.ts, orderStatus.ts, delivery.ts, errors.ts
└── frontend/
    ├── public/covers/           # Book and author cover images
    └── src/
        ├── app/                 # Next.js App Router pages
        ├── components/          # BookCard, BookGrid, Header, QuantityStepper, PaymentDialog, etc.
        ├── context/             # AuthContext, CartContext
        ├── lib/                 # api.ts client, formatters.ts, types.ts
        └── styles/              # Carbon g100 dark theme Sass setup
```
