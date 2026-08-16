# Dhakshu Bakes REST API Reference

## Authentication Endpoints
- `POST /api/v1/auth/register` — Register new customer account
- `POST /api/v1/auth/login` — Login user & receive JWT token
- `GET /api/v1/auth/me` — Get logged-in user profile

## Products & Catalog Endpoints
- `GET /api/v1/products` — Filter products by category, price, search, eggless, sort
- `GET /api/v1/products/{slug}` — Get product details with variants & images
- `GET /api/v1/categories` — Get active categories

## Cart & Checkout Endpoints
- `GET /api/v1/cart` — Get cart items & subtotal
- `POST /api/v1/cart/items` — Add product variant to cart
- `POST /api/v1/coupons/validate` — Validate coupon code
- `POST /api/v1/orders/checkout` — Create order from cart items
- `POST /api/v1/payments/create-razorpay-order` — Create Razorpay payment order
- `POST /api/v1/payments/verify-razorpay` — Verify Razorpay HMAC signature

## Administrative Endpoints (`/api/v1/admin/**`)
- `GET /api/v1/admin/dashboard` — Key performance metrics & revenue chart
- `GET /api/v1/admin/orders` — All customer orders
- `PUT /api/v1/admin/orders/{orderId}/status` — Transition order baking status
- `GET /api/v1/admin/inventory` — Stock levels & threshold alerts
- `PUT /api/v1/admin/inventory/{variantId}` — Adjust stock quantity
