-- Dhakshu Bakes Initial Schema Migration (PostgreSQL Compatible)

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    landmark VARCHAR(255),
    address_type VARCHAR(50) NOT NULL DEFAULT 'HOME',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    ingredients TEXT,
    allergens TEXT,
    nutrition_facts TEXT,
    storage_instructions TEXT,
    delivery_info TEXT,
    rating_avg NUMERIC(3,2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    eggless BOOLEAN NOT NULL DEFAULT TRUE,
    bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    seasonal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    variant_name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    discount_price NUMERIC(10,2),
    weight_grams INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    out_of_stock BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    max_discount_amount NUMERIC(10,2),
    usage_limit INT,
    per_user_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    start_date DATE,
    expiry_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    shipping_address_line VARCHAR(500) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_pincode VARCHAR(20) NOT NULL,
    shipping_phone VARCHAR(50) NOT NULL,
    delivery_date DATE,
    delivery_time_slot VARCHAR(100),
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    order_notes TEXT,
    is_gift BOOLEAN DEFAULT FALSE,
    gift_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    payment_method VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(255),
    comment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    frequency VARCHAR(50) NOT NULL DEFAULT 'WEEKLY',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    delivery_day_of_week VARCHAR(20),
    next_delivery_date DATE,
    start_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    opening_hours VARCHAR(255),
    map_latitude NUMERIC(10,6),
    map_longitude NUMERIC(10,6),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS wholesale_inquiries (
    id BIGSERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    estimated_monthly_volume VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    display_order INT DEFAULT 0
);

-- Performance Database Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_coupon ON coupon_usages(user_id, coupon_id);
