-- Add sponsor branding columns to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS sponsor_name text DEFAULT NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS sponsor_logo_url text DEFAULT NULL;
