-- CRM prospects table for sales pipeline tracking (Agent Victor)
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                              -- Nom du restaurant / personne / organisation
  contact_name TEXT,                               -- Nom du contact (si différent)
  email TEXT,
  phone TEXT,
  instagram TEXT,
  website TEXT,
  city TEXT,
  canton TEXT,
  type TEXT DEFAULT 'restaurant',                  -- restaurant | partner | influencer
  source TEXT DEFAULT 'manual',                    -- brevo | insta_dm | call | partner_email | terrain | manual
  status TEXT DEFAULT 'new',                       -- new | contacted | replied | meeting | trial | paying | lost
  priority TEXT DEFAULT 'normal',                  -- hot | normal | low
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  follow_up_action TEXT,                           -- relance_email | appel | rdv | envoyer_offre | rien
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  affiliate_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_next_follow_up ON prospects(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_type ON prospects(type);
CREATE INDEX IF NOT EXISTS idx_prospects_priority ON prospects(priority);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
-- Admin only (service_role) — no public access
