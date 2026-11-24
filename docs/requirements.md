# E-Bookstore Platform – Proof of Concept (PoC)

> Detailed requirement decisions are in [`decisions.md`](decisions.md). If the wireframes in `photos/` differ from the text, `decisions.md` takes precedence.

## Goal

Plan and develop a small Proof of Concept (PoC) for an e-commerce bookstore platform.

The goal is to establish a basic end-to-end e-commerce experience, covering user authentication, product browsing, catalogue navigation, shopping cart management, checkout, payment simulation, and purchase confirmation.

The platform will sell **physical books only**. Books will be delivered to the delivery address provided by the customer. Digital downloads and digital fulfilment are outside the scope of this PoC.

The project should remain intentionally small and focused on the core functionalities. The objective at this stage is to define the architecture, data model, API specifications, application structure, and implementation plan before starting development.

Use the technologies and requirements outlined below. Avoid introducing unnecessary complexity or additional features beyond the defined scope.

# Use Cases

## E-Store – Home, Catalogue, Payment & Purchase Confirmation

### 1. Registration, Login & Authentication

1. **Register Page**
2. **Login Page**
3. **User Authentication**

### 2. Product Catalogue & Browsing

4. Access the product catalogue for each category.
5. Search books and sort the catalogue using predefined sort options.
6. Browse order history with a **Buy It Again** feature.
7. Receive simple product recommendations based on order history.
8. Select a product category.
9. Browse products by author.
10. Select a product and display its estimated delivery date.
11. View and select related products.
12. Add a product to the wishlist.

### 3. Basket & Checkout

13. Add selected product(s) to the basket.
14. Enter the delivery address.

### 4. Payment & Purchase Confirmation

15. Initiate payment using the appropriate payment option.
16. Receive payment confirmation.
17. Receive purchase confirmation.

### 5. Order Management

18. Cancel an order within 48 hours.

# Architecture – Flow and Functionalities

## 1. User Flow

1. Users access the website. Guests can browse the catalogue and product pages.
2. Users register or log in before using the cart, wishlist, checkout or orders. Guests who open these are redirected to the Login Page.
3. Users navigate to the Browse section.
4. Users browse catalogues and products.
5. Users add products to the Shopping Cart.
6. Users proceed to Checkout (the cart and checkout are one screen).
7. Users enter a delivery address.
8. Payment is simulated through a simple mock payment process.
9. The purchase is confirmed and the order proceeds to Shipment.

## 2. Functionalities

### Member

- Registered Users
- Register, Login & Logout

### Catalog

- Browse Products by Category & Author
- Search and Sort Products
- Recommend Products based on Order History
- Show Related Products (also serves as upsell and cross-sell)
- Wishlist

### Order

- Create Orders
- Order Checkout
- Confirm and Cancel Orders
- Order History

### Payment

- Simulated Payment Processing
- Payment Confirmation

### Shipping

- Estimated Delivery Time
- Constant shipping cost

# E-Bookstore Platform – Features

## Platform Overview

The e-bookstore platform will provide users with a simple and intuitive shopping experience, allowing them to:

- Browse available books through a landing page.
- Select books from the catalogue.
- Add books to a shopping cart.
- Purchase books and simulate payment.
- Provide a delivery address for purchased books.
- Receive purchase confirmation.

## Features

### 1. Catalogue

- Select a product category.
- Access the catalogue for each category.
- Browse available authors.
- Search and sort products.
- Select products.
- View and select related products.
- Receive simple product recommendations based on order history.
- Add products to the wishlist.

### 2. Shopping Cart & Checkout

- Add products to the shopping cart.
- Change item quantities. A quantity of 0 removes the item.
- Enter a delivery address.
- Choose the appropriate payment method.

### 3. Payment Screen

- Initiate payment using the selected payment method.
- Simulate and complete the payment process.

### 4. Purchase Confirmation

- Display a purchase confirmation.
- Show a message confirming successful purchase completion.
- Display the purchased items.

### 5. Order Management

- Browse previous orders and use the Buy Again feature.
- Cancel an order within 48 hours.
- View order status.

# Technology Components and Workflow

## Technology Stack

- **Database:** PostgreSQL, accessed with plain `pg` (no ORM)
- **Backend:** Express.js with TypeScript
- **Authentication:** JWT in an httpOnly cookie
- **Frontend:** Next.js
- **Frontend Design System:** IBM Carbon Design System
- **Testing:** Vitest

## Frontend Requirements

- Use IBM Carbon Design System as the primary UI design system.
- Use Carbon React components and design tokens consistently.
- Follow Carbon's design guidelines and component conventions.
- Ensure a consistent and responsive user experience. Dark theme only.
- Avoid introducing additional UI component libraries unless strictly necessary.

## Technical Planning & Workflow

- Prepare the data model design based on the wireframes.
- Generate the OpenAPI specification.
- Prepare basic backend API unit tests.
- Prepare basic frontend unit tests for React components and relevant functionality.
- Prepare the application for local execution (no Docker, no deployment).

# PoC Constraints & Assumptions

To keep the implementation small and focused:

- Books are physical products only (Paperback, Hardcover).
- No digital downloads or digital fulfilment.
- Use sample books, authors, categories, covers and prices.
- Populate the initial catalogue through static data or database seed data.
- No administration UI is required initially. A single customer role exists.
- Guests can browse the catalogue. Users must authenticate to use the cart, wishlist, checkout and orders.
- Use a simple mock payment process. It accepts any input and no real transactions or payment gateway integration exist.
- All prices and transactions should use EUR (€).
- Recommendations should use simple rule-based logic, without AI or external recommendation services.
- No gift points, loyalty programs or coupon functionality.
- No reviews, ratings, returns, or inventory management.
- Shipping and delivery should be represented through simple estimated delivery information and a constant shipping cost.
- Avoid implementing complex payment, shipping or inventory management infrastructure.

# Instructions for Planning

Before implementing anything:

1. Analyze the requirements and identify the main application components.
2. Define the proposed architecture and project structure.
3. Design the database model using PostgreSQL.
4. Define the backend APIs and generate the OpenAPI specification.
5. Define the frontend application structure using Next.js and IBM Carbon Design System.
6. Map the main user journeys and interactions.
7. Identify the required unit tests for the backend and frontend.
8. Define a phased implementation plan.
9. Identify ambiguities, missing requirements and architectural decisions that require clarification.
10. Propose simple defaults for unresolved decisions, keeping the PoC scope in mind.

Keep the solution simple and suitable for a small PoC. Identify ambiguities or missing requirements, but do not expand the scope unnecessarily.

**At this stage, focus on planning and architecture only. Do not start implementation until the plan has been reviewed and approved.**
