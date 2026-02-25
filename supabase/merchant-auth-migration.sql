-- ============================================
-- Just-Tag.ch — Merchant Auth Migration
-- Adds auth_user_id to merchants + updates RLS policies
-- ============================================

-- Ajouter colonne auth_user_id à merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_merchants_auth_user ON merchants(auth_user_id);

-- Mettre à jour les RLS policies pour utiliser auth_user_id
DROP POLICY IF EXISTS "Merchants can view own data" ON merchants;
CREATE POLICY "Merchants can view own data" ON merchants FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Merchants can update own data" ON merchants;
CREATE POLICY "Merchants can update own data" ON merchants FOR UPDATE
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Merchants can view own subscriptions" ON subscriptions;
CREATE POLICY "Merchants can view own subscriptions" ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = subscriptions.merchant_id AND merchants.auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Merchants can manage own restaurants" ON restaurants;
CREATE POLICY "Merchants can manage own restaurants" ON restaurants FOR ALL
  USING (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = restaurants.merchant_id AND merchants.auth_user_id = auth.uid()));

-- Policy pour images du restaurant du marchand
DROP POLICY IF EXISTS "Merchants can manage own restaurant images" ON restaurant_images;
CREATE POLICY "Merchants can manage own restaurant images" ON restaurant_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM restaurants r JOIN merchants m ON r.merchant_id = m.id
    WHERE r.id = restaurant_images.restaurant_id AND m.auth_user_id = auth.uid()
  ));

-- Policy pour menu items du restaurant du marchand
DROP POLICY IF EXISTS "Merchants can manage own menu items" ON menu_items;
CREATE POLICY "Merchants can manage own menu items" ON menu_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM restaurants r JOIN merchants m ON r.merchant_id = m.id
    WHERE r.id = menu_items.restaurant_id AND m.auth_user_id = auth.uid()
  ));

-- ============================================
-- Supabase Storage : bucket restaurant-images
-- (À créer manuellement dans le dashboard Supabase Storage)
-- ============================================
