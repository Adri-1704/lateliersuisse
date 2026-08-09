-- Create table for blog post translations (multilingual content)
CREATE TABLE IF NOT EXISTS blog_post_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('de', 'en', 'es', 'pt')),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_translations_post_locale
  ON blog_post_translations(post_id, locale);

-- RLS: public read, service role write
ALTER TABLE blog_post_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read translations"
  ON blog_post_translations FOR SELECT USING (true);

CREATE POLICY "Service role can write translations"
  ON blog_post_translations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
