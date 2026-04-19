-- Plat du jour : restaurants post their daily special via WhatsApp
CREATE TABLE IF NOT EXISTS plat_du_jour (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  price TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  posted_by_phone TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_plat_du_jour_restaurant ON plat_du_jour(restaurant_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_plat_du_jour_active ON plat_du_jour(is_active, posted_at DESC);

ALTER TABLE plat_du_jour ENABLE ROW LEVEL SECURITY;

-- Public can read active plats du jour
CREATE POLICY "Anyone can read active plats" ON plat_du_jour FOR SELECT USING (is_active = true);

-- Link restaurant phone number to restaurant for WhatsApp matching
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
