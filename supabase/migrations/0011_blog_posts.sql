-- Blog posts for SEO content strategy
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,                          -- résumé court (meta description / card)
  content TEXT NOT NULL,                 -- contenu en markdown
  cover_image TEXT,                      -- URL image de couverture
  category TEXT,                         -- ex: "guide", "top", "actualite", "conseil"
  tags TEXT[] DEFAULT '{}',              -- ex: {"geneve", "terrasse", "gastronomique"}
  author TEXT DEFAULT 'Adrien Haubrich',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title TEXT,                       -- override titre SEO (sinon = title)
  meta_description TEXT,                 -- override description SEO (sinon = excerpt)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public peut lire les articles publiés
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Insert/Update/Delete uniquement via service_role (admin)
