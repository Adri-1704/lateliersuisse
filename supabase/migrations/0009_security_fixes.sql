-- ============================================================================
-- Migration 0009: Security fixes (C1 + C3)
-- Date: 2026-04-13
-- ============================================================================

-- ── C1: Add is_admin column to profiles (if table exists) ──
-- If profiles table exists, add the column. Otherwise create a minimal profiles table.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Table exists, add column if not present
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin') THEN
      ALTER TABLE public.profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
    END IF;
  ELSE
    -- Create a minimal profiles table linked to auth.users
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      is_admin boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    -- Only the user themselves or service role can read their profile
    CREATE POLICY "Users can read own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- ── C3: Add stripe_checkout_session_id to subscriptions for idempotent upsert ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'stripe_checkout_session_id') THEN
    ALTER TABLE public.subscriptions ADD COLUMN stripe_checkout_session_id text;
    -- Unique constraint for idempotent upsert (allow NULLs for legacy rows)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_checkout_session
      ON public.subscriptions (stripe_checkout_session_id)
      WHERE stripe_checkout_session_id IS NOT NULL;
  END IF;
END $$;

-- ── C3 bonus: stripe_events table for event-level idempotence ──
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,                     -- Stripe event ID (evt_xxx)
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- No public access — only service role
CREATE POLICY "No public access to stripe_events" ON public.stripe_events
  FOR ALL USING (false);
