-- ─────────────────────────────────────────────────────────────────────────────
-- Conversion events tracking
--
-- Logs key funnel events (signup, checkout_initiated, payment_success,
-- subscription_active, affiliate_recruit) so we can measure the funnel
-- without depending only on Google Analytics.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  affiliate_ref TEXT,
  plan_type TEXT,
  amount_chf NUMERIC(10, 2),
  metadata JSONB,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_type
  ON conversion_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_merchant
  ON conversion_events(merchant_id)
  WHERE merchant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_events_affiliate
  ON conversion_events(affiliate_ref)
  WHERE affiliate_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_events_created
  ON conversion_events(created_at DESC);

-- RLS: only admin can read (no insert from client — server actions only)
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversion_events_admin_read" ON conversion_events;
CREATE POLICY "conversion_events_admin_read"
  ON conversion_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- No INSERT policy = inserts only via service_role key (server-side)
