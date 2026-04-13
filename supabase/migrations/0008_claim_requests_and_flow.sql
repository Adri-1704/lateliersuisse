-- ============================================
-- Migration: Claim Requests & Restaurant Claiming Flow
-- PR 1: Fondations DB + admin claims
-- ============================================

-- 0. Ajouter auth_user_id a merchants (le code l'attendait deja, dette technique rattrapee ici)
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_merchants_auth_user_id ON merchants(auth_user_id);

-- 1. Table claim_requests
CREATE TABLE IF NOT EXISTS claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'manual' CHECK (method IN ('manual', 'email_domain', 'sms_code')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_code TEXT,
  verification_email TEXT,
  proof_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE(restaurant_id, merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_restaurant ON claim_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_merchant ON claim_requests(merchant_id);

-- 2. Ajout colonnes a restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claim_status TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (claim_status IN ('unclaimed', 'pending', 'claimed'));

-- 3. Ajout colonnes a subscriptions (pas deja presentes dans le schema initial)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS is_early_bird BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 4. RLS policies pour claim_requests
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- Un merchant peut voir ses propres claims
CREATE POLICY "Merchants view own claims" ON claim_requests
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_user_id = auth.uid()
    )
  );

-- Un merchant peut creer un claim pour lui-meme
CREATE POLICY "Merchants create own claims" ON claim_requests
  FOR INSERT WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE auth_user_id = auth.uid()
    )
  );
