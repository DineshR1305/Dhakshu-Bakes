# Dhakshu Bakes Database Schema Specification

## Primary Entities & Tables

1. `users` — User accounts (`id`, `email`, `password`, `full_name`, `phone`, `role`, `enabled`)
2. `addresses` — Saved shipping addresses
3. `categories` — Product categories (`Cakes`, `Cupcakes`, `Brownies`, `Cookies`, `Pastries`, `Gift Boxes`)
4. `products` — Core catalog items (`name`, `slug`, `description`, `ingredients`, `allergens`, `is_eggless`, `is_featured`, `is_bestseller`, `rating_avg`)
5. `product_variants` — Specific weight/size options (`sku`, `variant_name`, `price`, `discount_price`, `weight_grams`)
6. `inventory` — Stock levels (`stock_quantity`, `reserved_quantity`, `low_stock_threshold`, `out_of_stock`, `version`)
7. `carts` & `cart_items` — Shopping cart persistence
8. `wishlists` & `wishlist_items` — User wishlist persistence
9. `orders` & `order_items` — Order fulfillment tracking (`order_number`, `order_status`, `payment_status`, `delivery_date`, `delivery_time_slot`)
10. `payments` — Razorpay payment logs (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`)
11. `coupons` — Promotional codes (`code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`)
12. `reviews` — Product reviews (`rating`, `review_text`, `status`, `is_verified_purchase`)
13. `subscriptions` — Recurring delivery schedules (`frequency`, `status`, `next_delivery_date`)
14. `stores` — Physical boutique store locations
15. `wholesale_inquiries`, `contact_inquiries`, `newsletter_subscribers`, `faqs`
