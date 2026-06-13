-- ============================================================
-- Savory Restaurant — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL Editor to set up the database.
-- Auth is handled by Supabase Auth (built-in `users` table).
-- ============================================================

-- 1. ENUM: order status
CREATE TYPE order_status AS ENUM ('Pending', 'Confirmed', 'Delivered', 'Cancelled');

-- 2. TABLE: menu_items
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'burgers',
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: orders
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'Pending'
);

-- 4. TABLE: order_items
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1
);

-- 5. INDEXES for performance
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 6. Enable Row Level Security (optional — customize as needed)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies — allow public read for menu_items, authenticated write for orders

-- Menu items: public can read
CREATE POLICY "Public can read menu items"
  ON menu_items FOR SELECT
  USING (true);

-- Menu items: only authenticated staff can insert/update/delete
CREATE POLICY "Staff can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update menu items"
  ON menu_items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can delete menu items"
  ON menu_items FOR DELETE
  USING (auth.role() = 'authenticated');

-- Orders: public can insert (anyone can place an order)
CREATE POLICY "Anyone can place an order"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: authenticated staff can read/update
CREATE POLICY "Staff can read orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Order items: public can insert (needed to place orders)
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Order items: authenticated staff can read
CREATE POLICY "Staff can read order items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- 8. Enable real-time for the orders table (needed for live updates)
-- Run this in the Supabase dashboard under Database > Replication
-- or via:
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
