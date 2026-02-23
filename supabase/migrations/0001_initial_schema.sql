-- ============================================
-- Just-Tag.ch - Initial Database Schema
-- Platform for discovering restaurants in Switzerland
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE subscription_plan AS ENUM ('monthly', 'semiannual', 'annual', 'lifetime');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');
CREATE TYPE price_range AS ENUM ('1', '2', '3', '4');

-- ============================================
-- TABLE: cuisine_types
-- ============================================
CREATE TABLE cuisine_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT, -- emoji or icon identifier
  restaurant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cuisine_types_slug ON cuisine_types(slug);

-- ============================================
-- TABLE: merchants (restaurant owners)
-- ============================================
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_merchants_email ON merchants(email);
CREATE INDEX idx_merchants_stripe_customer ON merchants(stripe_customer_id);

-- ============================================
-- TABLE: subscriptions
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_merchant ON subscriptions(merchant_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- TABLE: restaurants
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Trilingual content
  name_fr TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_de TEXT,
  description_en TEXT,

  -- Classification
  cuisine_type_id UUID REFERENCES cuisine_types(id) ON DELETE SET NULL,
  cuisine_type TEXT, -- denormalized slug for quick filtering

  -- Location
  canton TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Attributes
  price_range price_range DEFAULT '2',
  avg_rating NUMERIC(2,1) DEFAULT 0.0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  review_count INTEGER DEFAULT 0,
  opening_hours JSONB DEFAULT '{}',
  features TEXT[] DEFAULT '{}',

  -- Media
  cover_image TEXT,

  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,

  -- Full-text search vector
  search_vector TSVECTOR,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_canton ON restaurants(canton);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_price ON restaurants(price_range);
CREATE INDEX idx_restaurants_rating ON restaurants(avg_rating DESC);
CREATE INDEX idx_restaurants_featured ON restaurants(is_featured) WHERE is_featured = true;
CREATE INDEX idx_restaurants_published ON restaurants(is_published) WHERE is_published = true;
CREATE INDEX idx_restaurants_merchant ON restaurants(merchant_id);
CREATE INDEX idx_restaurants_search ON restaurants USING GIN(search_vector);

-- Composite index for common filter combinations
CREATE INDEX idx_restaurants_canton_cuisine ON restaurants(canton, cuisine_type) WHERE is_published = true;
CREATE INDEX idx_restaurants_canton_rating ON restaurants(canton, avg_rating DESC) WHERE is_published = true;

-- ============================================
-- TABLE: restaurant_images
-- ============================================
CREATE TABLE restaurant_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);
CREATE INDEX idx_restaurant_images_position ON restaurant_images(restaurant_id, position);

-- ============================================
-- TABLE: reviews
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_rating ON reviews(restaurant_id, rating);
CREATE INDEX idx_reviews_created ON reviews(restaurant_id, created_at DESC);

-- ============================================
-- TABLE: menu_items
-- ============================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Trilingual content
  name_fr TEXT NOT NULL,
  name_de TEXT,
  name_en TEXT,
  description_fr TEXT,
  description_de TEXT,
  description_en TEXT,

  price NUMERIC(8,2) NOT NULL,
  category TEXT NOT NULL, -- e.g., 'entrees', 'plats', 'desserts'
  position INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(restaurant_id, category);

-- ============================================
-- TABLE: featured_restaurants (restaurant of the month)
-- ============================================
CREATE TABLE featured_restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(restaurant_id, month, year)
);

CREATE INDEX idx_featured_month_year ON featured_restaurants(year DESC, month DESC);

-- ============================================
-- TABLE: contact_submissions
-- ============================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: newsletter_subscribers
-- ============================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_restaurant_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', unaccent(coalesce(NEW.name_fr, ''))), 'A') ||
    setweight(to_tsvector('german', unaccent(coalesce(NEW.name_de, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.name_en, ''))), 'A') ||
    setweight(to_tsvector('french', unaccent(coalesce(NEW.description_fr, ''))), 'B') ||
    setweight(to_tsvector('german', unaccent(coalesce(NEW.description_de, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description_en, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.city, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.canton, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.cuisine_type, ''))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER trg_restaurant_search_vector
  BEFORE INSERT OR UPDATE OF name_fr, name_de, name_en, description_fr, description_de, description_en, city, canton, cuisine_type
  ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_search_vector();

-- Function to update restaurant avg_rating and review_count
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE restaurants
    SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE restaurant_id = OLD.restaurant_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = OLD.restaurant_id),
      updated_at = now()
    WHERE id = OLD.restaurant_id;
    RETURN OLD;
  ELSE
    UPDATE restaurants
    SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE restaurant_id = NEW.restaurant_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
      updated_at = now()
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review count/rating updates
CREATE TRIGGER trg_update_restaurant_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();

-- Function to update cuisine_type restaurant_count
CREATE OR REPLACE FUNCTION update_cuisine_type_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old cuisine type count
  IF TG_OP = 'UPDATE' AND OLD.cuisine_type_id IS DISTINCT FROM NEW.cuisine_type_id THEN
    UPDATE cuisine_types
    SET restaurant_count = (SELECT COUNT(*) FROM restaurants WHERE cuisine_type_id = OLD.cuisine_type_id AND is_published = true)
    WHERE id = OLD.cuisine_type_id;
  END IF;

  -- Update new/current cuisine type count
  IF TG_OP = 'DELETE' THEN
    IF OLD.cuisine_type_id IS NOT NULL THEN
      UPDATE cuisine_types
      SET restaurant_count = (SELECT COUNT(*) FROM restaurants WHERE cuisine_type_id = OLD.cuisine_type_id AND is_published = true)
      WHERE id = OLD.cuisine_type_id;
    END IF;
  ELSE
    IF NEW.cuisine_type_id IS NOT NULL THEN
      UPDATE cuisine_types
      SET restaurant_count = (SELECT COUNT(*) FROM restaurants WHERE cuisine_type_id = NEW.cuisine_type_id AND is_published = true)
      WHERE id = NEW.cuisine_type_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_cuisine_count
  AFTER INSERT OR UPDATE OF cuisine_type_id, is_published OR DELETE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_cuisine_type_count();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER trg_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE cuisine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view cuisine types"
  ON cuisine_types FOR SELECT
  USING (true);

CREATE POLICY "Public can view published restaurants"
  ON restaurants FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view restaurant images"
  ON restaurant_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_images.restaurant_id
      AND restaurants.is_published = true
    )
  );

CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = reviews.restaurant_id
      AND restaurants.is_published = true
    )
  );

CREATE POLICY "Public can view menu items"
  ON menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.is_published = true
    )
  );

CREATE POLICY "Public can view featured restaurants"
  ON featured_restaurants FOR SELECT
  USING (true);

-- Public can submit reviews
CREATE POLICY "Public can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Public can submit contact forms
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Public can subscribe to newsletter
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Service role (server-side) has full access via default
-- These policies use auth.uid() for authenticated merchant access

CREATE POLICY "Merchants can view own data"
  ON merchants FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Merchants can update own data"
  ON merchants FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Merchants can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = subscriptions.merchant_id
      AND auth.uid()::text = merchants.id::text
    )
  );

CREATE POLICY "Merchants can manage own restaurants"
  ON restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = restaurants.merchant_id
      AND auth.uid()::text = merchants.id::text
    )
  );

-- ============================================
-- SEED: Cuisine Types
-- ============================================
INSERT INTO cuisine_types (slug, name_fr, name_de, name_en, icon) VALUES
  ('italien', 'Italien', 'Italienisch', 'Italian', '🇮🇹'),
  ('francais', 'Francais', 'Franzosisch', 'French', '🇫🇷'),
  ('japonais', 'Japonais', 'Japanisch', 'Japanese', '🇯🇵'),
  ('suisse', 'Suisse', 'Schweizerisch', 'Swiss', '🇨🇭'),
  ('indien', 'Indien', 'Indisch', 'Indian', '🇮🇳'),
  ('chinois', 'Chinois', 'Chinesisch', 'Chinese', '🇨🇳'),
  ('mexicain', 'Mexicain', 'Mexikanisch', 'Mexican', '🇲🇽'),
  ('thai', 'Thailandais', 'Thailandisch', 'Thai', '🇹🇭'),
  ('mediterraneen', 'Mediterraneen', 'Mediterran', 'Mediterranean', '🌊'),
  ('americain', 'Americain', 'Amerikanisch', 'American', '🇺🇸'),
  ('espagnol', 'Espagnol', 'Spanisch', 'Spanish', '🇪🇸'),
  ('grec', 'Grec', 'Griechisch', 'Greek', '🇬🇷'),
  ('coreen', 'Coreen', 'Koreanisch', 'Korean', '🇰🇷'),
  ('vietnamien', 'Vietnamien', 'Vietnamesisch', 'Vietnamese', '🇻🇳'),
  ('libanais', 'Libanais', 'Libanesisch', 'Lebanese', '🇱🇧'),
  ('turc', 'Turc', 'Turkisch', 'Turkish', '🇹🇷'),
  ('argentin', 'Argentin', 'Argentinisch', 'Argentinian', '🇦🇷'),
  ('peruvien', 'Peruvien', 'Peruanisch', 'Peruvian', '🇵🇪'),
  ('ethiopien', 'Ethiopien', 'Athiopisch', 'Ethiopian', '🇪🇹'),
  ('fusion', 'Fusion', 'Fusion', 'Fusion', '🔥'),
  ('fruits-de-mer', 'Fruits de mer', 'Meeresfruchte', 'Seafood', '🦞'),
  ('vegetarien', 'Vegetarien', 'Vegetarisch', 'Vegetarian', '🥬'),
  ('vegan', 'Vegan', 'Vegan', 'Vegan', '🌱'),
  ('gastronomique', 'Gastronomique', 'Gourmet', 'Fine Dining', '⭐');
