-- ============================================
-- Just-Tag.ch - B2B Contact Requests
-- Table for restaurant owner inquiries
-- ============================================

CREATE TABLE b2b_contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  restaurant_name TEXT NOT NULL,
  city TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, converted, archived
  locale TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_b2b_requests_email ON b2b_contact_requests(email);
CREATE INDEX idx_b2b_requests_status ON b2b_contact_requests(status);
CREATE INDEX idx_b2b_requests_created ON b2b_contact_requests(created_at DESC);

ALTER TABLE b2b_contact_requests ENABLE ROW LEVEL SECURITY;

-- Public can submit contact requests
CREATE POLICY "Allow public inserts" ON b2b_contact_requests
  FOR INSERT WITH CHECK (true);
