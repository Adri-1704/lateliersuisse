-- unaccent() is not IMMUTABLE by default, which is required for generated columns.
-- Create an immutable wrapper so PostgreSQL allows it in GENERATED ALWAYS AS expressions.
CREATE OR REPLACE FUNCTION unaccent_immutable(text)
RETURNS text AS $$
  SELECT unaccent($1);
$$ LANGUAGE sql STRICT IMMUTABLE;

-- Add accent-insensitive search column
-- Combines name_fr, name_de, name_en and city into a single lowercase unaccented text
-- so ILIKE searches match regardless of accents (e.g. "etoile" finds "Étoile")
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS name_search TEXT GENERATED ALWAYS AS (
  lower(
    unaccent_immutable(
      coalesce(name_fr, '') || ' ' ||
      coalesce(name_de, '') || ' ' ||
      coalesce(name_en, '') || ' ' ||
      coalesce(city, '')
    )
  )
) STORED;

CREATE INDEX IF NOT EXISTS idx_restaurants_name_search
ON restaurants(name_search);
