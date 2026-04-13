-- Restaurant page views tracking
CREATE TABLE IF NOT EXISTS restaurant_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  CONSTRAINT fk_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Index for fast queries by restaurant + date
CREATE INDEX IF NOT EXISTS idx_restaurant_views_restaurant_date
  ON restaurant_views(restaurant_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_views_date
  ON restaurant_views(viewed_at DESC);

-- RLS: anyone can insert (anonymous tracking)
ALTER TABLE restaurant_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert views"
  ON restaurant_views FOR INSERT
  WITH CHECK (true);

-- Merchants can read their own restaurant's views
CREATE POLICY "Merchants can read their views"
  ON restaurant_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      JOIN merchants m ON r.merchant_id = m.id
      WHERE r.id = restaurant_views.restaurant_id
      AND m.auth_user_id = auth.uid()
    )
  );
