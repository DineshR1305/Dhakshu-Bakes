# Dhakshu Bakes — Full-Stack E-Commerce Bakery Platform

> "Freshly Baked. Made With Love."

A production-grade, full-stack e-commerce platform for handcrafted cakes, gourmet cupcakes, Belgian chocolate brownies, butter cookies, artisan pastries, gifting hampers, and recurring product subscriptions.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Home & Hero Section**: Announcement bar, category pills, featured bakes, bestsellers carousel, customer testimonials, newsletter signup.
- **Product Catalog & Filtering**: Real-time search, category filtering, eggless toggle, bestseller filter, price range slider, and multi-option sorting.
- **Product Detail**: Image gallery, variant selection (500g, 1kg, etc.), pure eggless indicator, ingredients, allergen info, nutrition facts, storage tips, customer reviews, and rating form.
- **Shopping Cart & Wishlist**: Persistent cart and wishlist, live coupon code validation (`WELCOME10`, `DHAKSHU100`), item quantity controls, cost breakdowns.
- **Checkout & Razorpay Payments**: Shipping address creation, delivery date picker, delivery time slot selection, gifting customization, and server-side verified Razorpay online payment integration.
- **Order Fulfillment Tracking**: Multi-stage visual baking timeline tracker (`Ordered` → `Confirmed` → `Preparing` → `Baking` → `Ready` → `Out for Delivery` → `Delivered`).
- **Auxiliary Pages**: Gifting hampers (`/gifts`), Subscriptions (`/subscriptions`), Store Locator (`/stores`), Wholesale Inquiries (`/wholesale`), Contact Us (`/contact`), FAQs (`/faq`).

### 🛡️ Administrative Portal (`/admin`)
- **Executive Analytics Dashboard**: Real-time sales revenue, today's sales, monthly sales, total orders, pending orders, registered customers, low-stock alerts, weekly revenue trend chart.
- **Order Fulfillment Management**: Search orders, filter by status, transition order baking status (`PENDING` → `BAKING` → `DELIVERED`).
- **Inventory Control**: Stock quantity adjustments, low-stock threshold alerts, out-of-stock indicators.
- **Coupons & Vouchers**: Percentage or fixed discount promotional coupon creation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router DOM v6, Tailwind CSS (warm cream/caramel palette), Axios, Lucide React, Zustand State Management.
- **Backend**: Java 21 LTS, Spring Boot 3.2+, Spring Web, Spring Security, JWT 0.11.5, Spring Data JPA, Hibernate, Bean Validation, Razorpay Java SDK.
- **Database**: Dual profile support — H2 Database in PostgreSQL compatibility mode for zero-setup local runnability, PostgreSQL for production.
- **Security**: JWT stateless authentication, BCrypt password hashing ($10+ rounds), server-side price recalculation, server-side Razorpay HMAC-SHA256 signature verification.

---

## 🔑 Demo Login Credentials

| User Type | Email | Password | Role |
|---|---|---|---|
| **Customer** | `customer@dhakshubakes.local` | `Customer@12345` | `ROLE_CUSTOMER` |
| **Admin** | `admin@dhakshubakes.local` | `Admin@12345` | `ROLE_ADMIN` |

---

## 🚀 Running Locally

### 1. Backend Setup
```bash
cd dhakshu-bakes/backend
mvn spring-boot:run
```
The REST API server will start on `http://localhost:8080`.
H2 Console available at `http://localhost:8080/h2-console`.

### 2. Frontend Setup
```bash
cd dhakshu-bakes/frontend
npm run dev
```
The web application will open on `http://localhost:5173`.

---

## 📂 Project Structure

```
dhakshu-bakes/
├── frontend/             # React + Vite + Tailwind CSS App
├── backend/              # Java 21 Spring Boot REST API Service
├── docs/                 # Architecture, Database, API, Dev & Deployment Docs
├── postman/              # Postman API Collection JSON
├── .env.example          # Safe Template Environment Variables
├── .gitignore            # Secret & Build Artifact Protection
└── README.md
```

---

## 📜 Documentation

- [Architecture Guide](docs/architecture.md)
- [Database ER Model](docs/database.md)
- [API Reference](docs/api.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
