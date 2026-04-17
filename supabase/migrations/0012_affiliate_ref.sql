-- Add affiliate tracking column to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS affiliate_ref TEXT;

-- Index for affiliate reporting
CREATE INDEX IF NOT EXISTS idx_subscriptions_affiliate_ref
  ON subscriptions(affiliate_ref)
  WHERE affiliate_ref IS NOT NULL;
