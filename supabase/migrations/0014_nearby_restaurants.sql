-- Function to find nearby restaurants using Haversine formula
-- Returns restaurants sorted by distance from given coordinates
CREATE OR REPLACE FUNCTION nearby_restaurants(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION DEFAULT 20,
  result_limit INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name_fr TEXT,
  name_de TEXT,
  name_en TEXT,
  description_fr TEXT,
  city TEXT,
  canton TEXT,
  cuisine_type TEXT,
  avg_rating DOUBLE PRECISION,
  review_count INTEGER,
  price_range TEXT,
  features TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cover_image TEXT,
  is_featured BOOLEAN,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    r.id, r.slug, r.name_fr, r.name_de, r.name_en,
    r.description_fr, r.city, r.canton, r.cuisine_type,
    r.avg_rating, r.review_count, r.price_range,
    r.features, r.latitude, r.longitude,
    r.cover_image, r.is_featured,
    -- Haversine formula (distance in km)
    6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(r.latitude))
        * cos(radians(r.longitude) - radians(user_lon))
        + sin(radians(user_lat)) * sin(radians(r.latitude))
      ))
    ) AS distance_km
  FROM restaurants r
  WHERE r.is_published = true
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
  HAVING 6371 * acos(
    LEAST(1.0, GREATEST(-1.0,
      cos(radians(user_lat)) * cos(radians(r.latitude))
      * cos(radians(r.longitude) - radians(user_lon))
      + sin(radians(user_lat)) * sin(radians(r.latitude))
    ))
  ) <= max_distance_km
  ORDER BY distance_km ASC
  LIMIT result_limit;
$$;
