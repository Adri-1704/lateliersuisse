-- ============================================
-- Migration: Happy Hours MVP V1 Light
-- ============================================
-- Feature dediee aux creneaux promotionnels dynamiques ("Happy Hours").
-- V1 Light : pas de push WhatsApp automatique (zero cout). Uniquement :
--   - stockage et gestion des HH par le merchant
--   - affichage public (listing, fiche resto, bandeau homepage)
--   - tracking simple (views, clicks)
--   - partage manuel via lien wa.me et QR code (cote client)
-- ============================================

CREATE TABLE IF NOT EXISTS happy_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Contenu
  title TEXT NOT NULL,
  description TEXT,

  -- Type de remise
  promo_type TEXT NOT NULL
    CHECK (promo_type IN ('percentage', 'fixed_amount', 'free_item', 'special_menu')),
  promo_value TEXT,

  -- Creneau (UTC TIMESTAMPTZ, conversion Europe/Zurich cote UI)
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT hh_valid_window CHECK (ends_at > starts_at),

  -- Capacite optionnelle
  places_total INT,

  -- Lifecycle
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Stats denormalisees (evite les COUNT(*) onereux)
  views_count INT NOT NULL DEFAULT 0,
  clicks_count INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes pour les queries principales
CREATE INDEX IF NOT EXISTS idx_happy_hours_restaurant_starts
  ON happy_hours(restaurant_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_happy_hours_active_window
  ON happy_hours(is_active, starts_at, ends_at)
  WHERE is_active = true;

-- Trigger updated_at (reutilise la fonction set_updated_at existante si presente,
-- sinon on la cree ici de facon idempotente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_happy_hours_updated ON happy_hours;
CREATE TRIGGER trg_happy_hours_updated
  BEFORE UPDATE ON happy_hours
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE happy_hours ENABLE ROW LEVEL SECURITY;

-- Lecture publique : tout le monde peut lire les HH actives en cours / a venir
-- (le filtrage temporel fin se fait dans les queries pour beneficier des indexes)
DROP POLICY IF EXISTS "Public read active HH" ON happy_hours;
CREATE POLICY "Public read active HH" ON happy_hours
  FOR SELECT USING (is_active = true);

-- Le merchant peut CRUD ses propres HH.
-- On s'aligne sur le pattern existant : restaurants.merchant_id -> merchants.auth_user_id
-- Toutes les ecritures passent cependant par des server actions avec
-- createAdminClient + ownership check applicatif (cf /src/lib/merchant-auth.ts),
-- cette policy reste une defense en profondeur.
DROP POLICY IF EXISTS "Merchant manages own HH" ON happy_hours;
CREATE POLICY "Merchant manages own HH" ON happy_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      JOIN merchants m ON m.id = r.merchant_id
      WHERE r.id = happy_hours.restaurant_id
        AND m.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants r
      JOIN merchants m ON m.id = r.merchant_id
      WHERE r.id = happy_hours.restaurant_id
        AND m.auth_user_id = auth.uid()
    )
  );
