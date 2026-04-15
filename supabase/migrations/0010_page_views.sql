-- Site-wide page view tracking (pour dashboard admin trafic)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,                                    -- "/fr/restaurants/canton/geneve"
  locale TEXT,                                           -- "fr", "de", "en", "pt", "es"
  page_type TEXT,                                        -- "home" | "restaurant" | "canton" | "collection" | "b2b" | "about" | "other"
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  canton TEXT,                                           -- canton slug if applicable
  referrer TEXT,
  country TEXT,
  ip_hash TEXT,                                          -- privacy : hash, jamais IP brute
  user_agent TEXT,
  session_id TEXT,                                       -- anonymous session tracking (1 par tab)
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes critiques pour aggregations
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_type ON page_views(page_type);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_locale ON page_views(locale);
CREATE INDEX IF NOT EXISTS idx_page_views_restaurant_id
  ON page_views(restaurant_id)
  WHERE restaurant_id IS NOT NULL;

-- RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer (tracking anonyme)
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Personne ne peut lire via client API (on utilise service_role côté admin)
-- Pas de policy SELECT = tout accès client refusé par défaut
