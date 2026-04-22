-- Migration: Add 'site' column to blog_posts to isolate Yattoo vs Just-Tag articles
-- Context: Yattoo and Just-Tag share the same Supabase project (odbkdijcmwqdxctukjmh).
-- Both apps write to blog_posts without a discriminator, leading to cross-contamination
-- (14 Just-Tag restaurant articles showing up in yattoo.io/admin/blog).
--
-- This migration:
--   1. Adds a 'site' column (default 'yattoo' to preserve existing Yattoo posts).
--   2. Backfills the 14 Just-Tag articles using slug heuristics.
--   3. Adds indexes for fast per-site filtering.
--
-- Safe to re-run (IF NOT EXISTS everywhere).

-- 1. Add 'site' column to distinguish Yattoo vs Just-Tag blog posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'yattoo'
  CHECK (site IN ('yattoo', 'just-tag'));

-- 2. Backfill existing 14 Just-Tag articles (they all have restaurant/city slugs)
UPDATE blog_posts
SET site = 'just-tag'
WHERE
  slug LIKE '%restaurant%'
  OR slug LIKE '%resto%'
  OR slug LIKE 'ou-%'
  OR slug LIKE 'guide-%'
  OR slug LIKE 'meilleur%'
  OR slug LIKE '%bruncher%'
  OR slug LIKE '%pizzeria%'
  OR slug LIKE '%terrasse%'
  OR slug LIKE '%vegetarien%'
  OR slug LIKE '%vegan%';

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_site ON blog_posts(site);
CREATE INDEX IF NOT EXISTS idx_blog_posts_site_published ON blog_posts(site, is_published, published_at DESC)
  WHERE is_published = true;
