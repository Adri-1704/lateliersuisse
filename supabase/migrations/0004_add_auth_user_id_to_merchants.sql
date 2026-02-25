-- Add auth_user_id column to merchants table to link with Supabase Auth
ALTER TABLE merchants ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_merchants_auth_user_id ON merchants(auth_user_id);
