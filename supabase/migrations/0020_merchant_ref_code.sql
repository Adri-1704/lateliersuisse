-- ─────────────────────────────────────────────────────────────────────────────
-- Affiliate program: unique ref_code per merchant
--
-- Each merchant gets an auto-generated ref code (e.g. "jt-x7m9q4") that they
-- can share. When someone visits with ?ref=jt-x7m9q4 and subscribes, the code
-- is stored in subscriptions.affiliate_ref (already added in 0012).
--
-- Generation strategy: prefix "jt-" + 6 random base36 chars (≈ 2 billion combos).
-- Re-rolls if collision (extremely rare).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS ref_code TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_merchants_ref_code
  ON merchants(ref_code)
  WHERE ref_code IS NOT NULL;

-- Helper function: generate a random ref code
CREATE OR REPLACE FUNCTION generate_merchant_ref_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := 'jt-';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger: auto-generate ref_code on merchant insert if not provided
CREATE OR REPLACE FUNCTION set_merchant_ref_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  IF NEW.ref_code IS NULL THEN
    LOOP
      new_code := generate_merchant_ref_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM merchants WHERE ref_code = new_code);
      attempts := attempts + 1;
      IF attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique ref_code after 10 attempts';
      END IF;
    END LOOP;
    NEW.ref_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_merchant_ref_code ON merchants;
CREATE TRIGGER trg_set_merchant_ref_code
  BEFORE INSERT ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_ref_code();

-- Backfill existing merchants without a ref_code
DO $$
DECLARE
  m RECORD;
  new_code TEXT;
  attempts INTEGER;
BEGIN
  FOR m IN SELECT id FROM merchants WHERE ref_code IS NULL LOOP
    attempts := 0;
    LOOP
      new_code := generate_merchant_ref_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM merchants WHERE ref_code = new_code);
      attempts := attempts + 1;
      EXIT WHEN attempts > 10;
    END LOOP;
    UPDATE merchants SET ref_code = new_code WHERE id = m.id;
  END LOOP;
END $$;
