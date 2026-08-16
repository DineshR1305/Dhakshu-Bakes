# Dhakshu Bakes Architecture & Tech Specs

## System Architecture

```
[ Frontend: React 18 + Vite + Tailwind CSS ]
                       │
             HTTP / REST (JSON)
                       │
                       ▼
[ Backend: Spring Boot 3.2+ (Java 21) REST Service ]
    ├── Security: JWT Filter + BCrypt Password Encoder
    ├── Spring Data JPA & Hibernate ORM
    └── Services: Auth, Product, Cart, Order, Razorpay Payment, Coupon, Admin
                       │
                       ▼
[ Database: PostgreSQL / H2 (Postgres Compatibility Mode) ]
```

## Core Security & Business Guarantees

1. **Server-Side Price Calculation**: Order totals, item unit prices, discounts, and delivery fees are computed directly on the backend database entities. Frontend price parameters are ignored for checkout security.
2. **Razorpay HMAC Signature Verification**: Server validates payment callbacks using `HmacSHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)`.
3. **Inventory Reservation**: Inventory stock levels use `@Version` optimistic locking to prevent concurrent overselling.
