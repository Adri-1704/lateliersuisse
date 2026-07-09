-- Track read/delivered counts per broadcast
ALTER TABLE whatsapp_broadcasts
  ADD COLUMN IF NOT EXISTS delivered_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS read_count INT NOT NULL DEFAULT 0;

-- Per-message wamid → broadcast mapping
CREATE TABLE IF NOT EXISTS whatsapp_message_tracking (
  wamid TEXT PRIMARY KEY,
  broadcast_id UUID NOT NULL REFERENCES whatsapp_broadcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wamt_broadcast_id
  ON whatsapp_message_tracking(broadcast_id);

-- Atomic increment to avoid race conditions
CREATE OR REPLACE FUNCTION increment_broadcast_stat(
  p_broadcast_id UUID,
  p_field TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_field = 'read_count' THEN
    UPDATE whatsapp_broadcasts SET read_count = read_count + 1 WHERE id = p_broadcast_id;
  ELSIF p_field = 'delivered_count' THEN
    UPDATE whatsapp_broadcasts SET delivered_count = delivered_count + 1 WHERE id = p_broadcast_id;
  END IF;
END;
$$;
