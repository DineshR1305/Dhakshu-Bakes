-- Flyway Migration V3: Add Product Customization, Delivery Slots, and Serviceable Pincodes

-- 1. Extend products table for customization options
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_message_allowed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS special_instructions_allowed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS eggless_allowed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gift_wrap_allowed BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS eggless_surcharge NUMERIC(10,2) NOT NULL DEFAULT 50.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gift_wrap_fee NUMERIC(10,2) NOT NULL DEFAULT 30.00;

-- 2. Extend cart_items table for item-level customization
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS custom_message VARCHAR(200);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS special_instructions VARCHAR(500);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS is_eggless BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS is_gift_wrapped BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS customization_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- 3. Extend order_items table for item-level customization persistence
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_message VARCHAR(200);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS special_instructions VARCHAR(500);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_eggless BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_gift_wrapped BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customization_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- 4. Extend orders table for delivery details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customization_total NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- 5. Delivery Slots table
CREATE TABLE IF NOT EXISTS delivery_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL DEFAULT 10,
    extra_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0
);

-- Seed default delivery slots if none exist
INSERT INTO delivery_slots (slot_name, start_time, end_time, max_capacity, extra_fee, active, display_order)
SELECT 'Morning (9 AM - 12 PM)', '09:00:00', '12:00:00', 10, 0.00, TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM delivery_slots WHERE slot_name LIKE 'Morning%');

INSERT INTO delivery_slots (slot_name, start_time, end_time, max_capacity, extra_fee, active, display_order)
SELECT 'Afternoon (12 PM - 3 PM)', '12:00:00', '15:00:00', 10, 0.00, TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM delivery_slots WHERE slot_name LIKE 'Afternoon%');

INSERT INTO delivery_slots (slot_name, start_time, end_time, max_capacity, extra_fee, active, display_order)
SELECT 'Evening (4 PM - 7 PM)', '16:00:00', '19:00:00', 10, 0.00, TRUE, 3
WHERE NOT EXISTS (SELECT 1 FROM delivery_slots WHERE slot_name LIKE 'Evening%');

-- 6. Delivery Slot Bookings (Capacity tracking per date/slot)
CREATE TABLE IF NOT EXISTS delivery_slot_bookings (
    id BIGSERIAL PRIMARY KEY,
    delivery_date DATE NOT NULL,
    slot_id BIGINT NOT NULL REFERENCES delivery_slots(id) ON DELETE CASCADE,
    booked_count INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_date_slot UNIQUE (delivery_date, slot_id)
);

-- 7. Serviceable Pincodes Table
CREATE TABLE IF NOT EXISTS delivery_pincodes (
    id BIGSERIAL PRIMARY KEY,
    pincode VARCHAR(20) NOT NULL UNIQUE,
    area_name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    min_order_for_free_delivery NUMERIC(10,2) NOT NULL DEFAULT 499.00
);

-- Seed default serviceable pincodes for Coimbatore / regional bakery area
INSERT INTO delivery_pincodes (pincode, area_name, active)
VALUES
('641001', 'Coimbatore Main / Town Hall', TRUE),
('641002', 'R.S. Puram', TRUE),
('641004', 'Peelamedu / Hopes', TRUE),
('641006', 'Ganapathy', TRUE),
('641012', 'Gandhipuram', TRUE),
('641014', 'Singanallur / Ramanathapuram', TRUE),
('641018', 'Race Course', TRUE),
('641028', 'Sowripalayam / Udayampalayam', TRUE),
('641035', 'Saravanampatti / IT Park', TRUE),
('641044', 'Kovaipudur', TRUE)
ON CONFLICT (pincode) DO NOTHING;
