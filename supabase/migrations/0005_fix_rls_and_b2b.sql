-- ============================================
-- Fix RLS policies to use auth_user_id instead of merchants.id
-- Add missing notes column to b2b_contact_requests
-- Add reply fields to reviews table
-- ============================================

-- 1. Add missing notes column to b2b_contact_requests
ALTER TABLE b2b_contact_requests ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add reply fields to reviews (if not present)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_comment TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_date TIMESTAMPTZ;

-- 3. Add social media fields to restaurants (if not present)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- 4. Fix RLS policies for merchants - use auth_user_id instead of id
DROP POLICY IF EXISTS "Merchants can view own data" ON merchants;
CREATE POLICY "Merchants can view own data"
  ON merchants FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Merchants can update own data" ON merchants;
CREATE POLICY "Merchants can update own data"
  ON merchants FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- 5. Fix RLS policies for subscriptions
DROP POLICY IF EXISTS "Merchants can view own subscriptions" ON subscriptions;
CREATE POLICY "Merchants can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = subscriptions.merchant_id
      AND auth.uid() = merchants.auth_user_id
    )
  );

-- 6. Fix RLS policies for restaurants
DROP POLICY IF EXISTS "Merchants can manage own restaurants" ON restaurants;
CREATE POLICY "Merchants can manage own restaurants"
  ON restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = restaurants.merchant_id
      AND auth.uid() = merchants.auth_user_id
    )
  );
