-- Add GIN index on features column for efficient array containment queries
-- Used by the filtered restaurant listing (pagination PR)
CREATE INDEX IF NOT EXISTS idx_restaurants_features
  ON restaurants USING GIN(features)
  WHERE is_published = true;
