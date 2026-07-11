-- Add menu_pdf_url column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_pdf_url text DEFAULT NULL;
