-- ============================================
-- Just-Tag.ch — Combined Idempotent Migration
-- Safe to run multiple times (IF NOT EXISTS everywhere)
-- Paste this in: Supabase Dashboard → SQL Editor → Run
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================
-- ENUM TYPES (idempotent)
-- ============================================
DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('monthly', 'semiannual', 'annual', 'lifetime');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE price_range AS ENUM ('1', '2', '3', '4');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS cuisine_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  restaurant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cuisine_types_slug ON cuisine_types(slug);

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_merchants_stripe_customer ON merchants(stripe_customer_id);

CREATE TABLE IF NOT EXISTS subscriptions (
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
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant ON subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_de TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_de TEXT,
  description_en TEXT,
  cuisine_type_id UUID REFERENCES cuisine_types(id) ON DELETE SET NULL,
  cuisine_type TEXT,
  canton TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  website TEXT,
  price_range price_range DEFAULT '2',
  avg_rating NUMERIC(2,1) DEFAULT 0.0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  review_count INTEGER DEFAULT 0,
  opening_hours JSONB DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  cover_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_canton ON restaurants(canton);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_price ON restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_featured ON restaurants(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_published ON restaurants(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_merchant ON restaurants(merchant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_search ON restaurants USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_restaurants_canton_cuisine ON restaurants(canton, cuisine_type) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_canton_rating ON restaurants(canton, avg_rating DESC) WHERE is_published = true;

CREATE TABLE IF NOT EXISTS restaurant_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_position ON restaurant_images(restaurant_id, position);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(restaurant_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(restaurant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name_fr TEXT NOT NULL,
  name_de TEXT,
  name_en TEXT,
  description_fr TEXT,
  description_de TEXT,
  description_en TEXT,
  price NUMERIC(8,2) NOT NULL,
  category TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(restaurant_id, category);

CREATE TABLE IF NOT EXISTS featured_restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, month, year)
);
CREATE INDEX IF NOT EXISTS idx_featured_month_year ON featured_restaurants(year DESC, month DESC);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

CREATE TABLE IF NOT EXISTS b2b_contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  restaurant_name TEXT NOT NULL,
  city TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new',
  locale TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_b2b_requests_email ON b2b_contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_b2b_requests_status ON b2b_contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_b2b_requests_created ON b2b_contact_requests(created_at DESC);

-- ============================================
-- FUNCTIONS (CREATE OR REPLACE = idempotent)
-- ============================================

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

CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE restaurants SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE restaurant_id = OLD.restaurant_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = OLD.restaurant_id),
      updated_at = now()
    WHERE id = OLD.restaurant_id;
    RETURN OLD;
  ELSE
    UPDATE restaurants SET
      avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE restaurant_id = NEW.restaurant_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
      updated_at = now()
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_cuisine_type_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.cuisine_type_id IS DISTINCT FROM NEW.cuisine_type_id THEN
    UPDATE cuisine_types
    SET restaurant_count = (SELECT COUNT(*) FROM restaurants WHERE cuisine_type_id = OLD.cuisine_type_id AND is_published = true)
    WHERE id = OLD.cuisine_type_id;
  END IF;
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

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS (drop + create = idempotent)
-- ============================================

DROP TRIGGER IF EXISTS trg_restaurant_search_vector ON restaurants;
CREATE TRIGGER trg_restaurant_search_vector
  BEFORE INSERT OR UPDATE OF name_fr, name_de, name_en, description_fr, description_de, description_en, city, canton, cuisine_type
  ON restaurants FOR EACH ROW EXECUTE FUNCTION update_restaurant_search_vector();

DROP TRIGGER IF EXISTS trg_update_restaurant_rating ON reviews;
CREATE TRIGGER trg_update_restaurant_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

DROP TRIGGER IF EXISTS trg_update_cuisine_count ON restaurants;
CREATE TRIGGER trg_update_cuisine_count
  AFTER INSERT OR UPDATE OF cuisine_type_id, is_published OR DELETE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_cuisine_type_count();

DROP TRIGGER IF EXISTS trg_merchants_updated_at ON merchants;
CREATE TRIGGER trg_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_restaurants_updated_at ON restaurants;
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON menu_items;
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

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
ALTER TABLE b2b_contact_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first, then recreate
DROP POLICY IF EXISTS "Public can view cuisine types" ON cuisine_types;
CREATE POLICY "Public can view cuisine types" ON cuisine_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published restaurants" ON restaurants;
CREATE POLICY "Public can view published restaurants" ON restaurants FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public can view restaurant images" ON restaurant_images;
CREATE POLICY "Public can view restaurant images" ON restaurant_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = restaurant_images.restaurant_id AND restaurants.is_published = true));

DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = reviews.restaurant_id AND restaurants.is_published = true));

DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.is_published = true));

DROP POLICY IF EXISTS "Public can view featured restaurants" ON featured_restaurants;
CREATE POLICY "Public can view featured restaurants" ON featured_restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews" ON reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit contact forms" ON contact_submissions;
CREATE POLICY "Public can submit contact forms" ON contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public inserts" ON b2b_contact_requests;
CREATE POLICY "Allow public inserts" ON b2b_contact_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Merchants can view own data" ON merchants;
CREATE POLICY "Merchants can view own data" ON merchants FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Merchants can update own data" ON merchants;
CREATE POLICY "Merchants can update own data" ON merchants FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Merchants can view own subscriptions" ON subscriptions;
CREATE POLICY "Merchants can view own subscriptions" ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = subscriptions.merchant_id AND auth.uid()::text = merchants.id::text));

DROP POLICY IF EXISTS "Merchants can manage own restaurants" ON restaurants;
CREATE POLICY "Merchants can manage own restaurants" ON restaurants FOR ALL
  USING (EXISTS (SELECT 1 FROM merchants WHERE merchants.id = restaurants.merchant_id AND auth.uid()::text = merchants.id::text));

-- ============================================
-- SEED: Cuisine Types (skip if already exist)
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
  ('gastronomique', 'Gastronomique', 'Gourmet', 'Fine Dining', '⭐')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED: Restaurants (skip if already exist)
-- ============================================
INSERT INTO restaurants (slug, name_fr, name_de, name_en, description_fr, description_de, description_en, cuisine_type, canton, city, address, postal_code, phone, email, website, price_range, features, cover_image, is_featured, is_published, opening_hours) VALUES
('le-petit-prince', 'Le Petit Prince', 'Le Petit Prince', 'Le Petit Prince',
  'Un joyau de la gastronomie francaise au coeur de Geneve.',
  'Ein Juwel der franzosischen Gastronomie im Herzen von Genf.',
  'A gem of French gastronomy in the heart of Geneva.',
  'francais', 'geneve', 'Geneve', 'Rue du Rhone 42', '1204',
  '+41 22 310 55 66', 'contact@lepetitprince.ch', 'https://lepetitprince.ch',
  '4', ARRAY['terrace', 'parking', 'wifi', 'accessible', 'vegetarian'],
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', true, true,
  '{"monday": {"open": "12:00", "close": "14:30"}, "friday": {"open": "12:00", "close": "22:30"}, "saturday": {"open": "18:00", "close": "23:00"}, "sunday": {"closed": true}}'),
('ristorante-bella-vita', 'Ristorante Bella Vita', 'Ristorante Bella Vita', 'Ristorante Bella Vita',
  'Authentique cuisine italienne preparee avec passion.',
  'Authentische italienische Kuche mit Leidenschaft zubereitet.',
  'Authentic Italian cuisine prepared with passion.',
  'italien', 'zurich', 'Zurich', 'Bahnhofstrasse 78', '8001',
  '+41 44 221 33 44', 'info@bellavita.ch', 'https://bellavita.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', true, true,
  '{"monday": {"open": "11:30", "close": "23:00"}, "sunday": {"open": "12:00", "close": "22:00"}}'),
('sakura-sushi', 'Sakura Sushi', 'Sakura Sushi', 'Sakura Sushi',
  'Le meilleur sushi de Lausanne.',
  'Das beste Sushi in Lausanne.',
  'The best sushi in Lausanne.',
  'japonais', 'vaud', 'Lausanne', 'Place de la Palud 15', '1003',
  '+41 21 312 88 99', 'reservation@sakurasushi.ch', 'https://sakurasushi.ch',
  '3', ARRAY['wifi', 'vegetarian', 'takeaway'],
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', true, true,
  '{"monday": {"closed": true}, "friday": {"open": "11:30", "close": "22:30"}}'),
('chalet-alpin', 'Chalet Alpin', 'Chalet Alpin', 'Chalet Alpin',
  'Cuisine suisse traditionnelle avec vue sur le Cervin.',
  'Traditionelle Schweizer Kuche mit Blick auf das Matterhorn.',
  'Traditional Swiss cuisine with views of the Matterhorn.',
  'suisse', 'valais', 'Zermatt', 'Bahnhofstrasse 22', '3920',
  '+41 27 966 11 22', 'info@chaletalpin.ch', 'https://chaletalpin.ch',
  '2', ARRAY['terrace', 'parking', 'accessible', 'kids-friendly', 'live-music'],
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', true, true,
  '{"monday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "10:00", "close": "23:00"}}'),
('taj-mahal-bern', 'Taj Mahal', 'Taj Mahal', 'Taj Mahal',
  'Les saveurs de l''Inde au coeur de Berne.',
  'Die Aromen Indiens im Herzen von Bern.',
  'The flavors of India in the heart of Bern.',
  'indien', 'berne', 'Berne', 'Marktgasse 51', '3011',
  '+41 31 312 44 55', 'info@tajmahal-bern.ch', 'https://tajmahal-bern.ch',
  '2', ARRAY['wifi', 'vegetarian', 'vegan', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', false, true,
  '{"monday": {"open": "11:30", "close": "14:30"}}'),
('el-gaucho-basel', 'El Gaucho', 'El Gaucho', 'El Gaucho',
  'Steakhouse argentin premium a Bale.',
  'Premium argentinisches Steakhouse in Basel.',
  'Premium Argentinian steakhouse in Basel.',
  'argentin', 'bale-ville', 'Basel', 'Steinenberg 14', '4051',
  '+41 61 272 33 44', 'reservations@elgaucho.ch', 'https://elgaucho.ch',
  '3', ARRAY['terrace', 'parking', 'wifi', 'private-dining', 'live-music'],
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', true, true,
  '{"monday": {"closed": true}, "friday": {"open": "18:00", "close": "23:30"}}'),
('bangkok-garden', 'Bangkok Garden', 'Bangkok Garden', 'Bangkok Garden',
  'Cuisine thai authentique au bord du lac.',
  'Authentische thailandische Kuche am See.',
  'Authentic Thai cuisine by the lake.',
  'thai', 'lucerne', 'Lucerne', 'Seestrasse 8', '6003',
  '+41 41 210 55 66', 'info@bangkokgarden.ch', 'https://bangkokgarden.ch',
  '2', ARRAY['terrace', 'wifi', 'vegetarian', 'vegan', 'takeaway'],
  'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800', false, true,
  '{"monday": {"open": "11:30", "close": "14:30"}, "sunday": {"closed": true}}'),
('la-brasserie-du-lac', 'La Brasserie du Lac', 'Brasserie am See', 'The Lakeside Brasserie',
  'Brasserie elegante sur les rives du lac de Neuchatel.',
  'Elegante Brasserie am Neuenburgersee.',
  'Elegant brasserie on the shores of Lake Neuchatel.',
  'francais', 'neuchatel', 'Neuchatel', 'Quai Osterwald 12', '2000',
  '+41 32 725 11 22', 'contact@brasseriedulac.ch', 'https://brasseriedulac.ch',
  '3', ARRAY['terrace', 'parking', 'wifi', 'accessible', 'private-dining', 'lake-view'],
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800', false, true,
  '{"monday": {"closed": true}, "saturday": {"open": "11:30", "close": "23:00"}}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED: Reviews (skip duplicates)
-- ============================================
DO $$ BEGIN
  INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
    ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Marie D.', 5, 'Une experience gastronomique inoubliable.'),
    ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Thomas W.', 4, 'Excellente cuisine, presentation magnifique.'),
    ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Sophie L.', 5, 'Le meilleur restaurant francais de Geneve.'),
    ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'Anna K.', 5, 'Die besten Pasta in Zurich!'),
    ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'Pierre G.', 4, 'Tres bonne pizza napolitaine.'),
    ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), 'Yuki T.', 5, 'Enfin un vrai sushi de qualite en Suisse!'),
    ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Clara S.', 5, 'La meilleure fondue que j''ai mangee!'),
    ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Michael B.', 4, 'Great Swiss traditional food.'),
    ((SELECT id FROM restaurants WHERE slug = 'taj-mahal-bern'), 'Priya S.', 5, 'Reminds me of home!'),
    ((SELECT id FROM restaurants WHERE slug = 'el-gaucho-basel'), 'Roberto M.', 5, 'The best steak I''ve had in Switzerland.'),
    ((SELECT id FROM restaurants WHERE slug = 'bangkok-garden'), 'Lisa H.', 4, 'Authentic Thai flavors by the lake.'),
    ((SELECT id FROM restaurants WHERE slug = 'la-brasserie-du-lac'), 'Catherine V.', 4, 'Belle terrasse avec vue sur le lac.');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- SEED: Featured Restaurants (current month)
-- ============================================
INSERT INTO featured_restaurants (restaurant_id, month, year, position)
SELECT id, EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 0
FROM restaurants WHERE slug = 'le-petit-prince'
ON CONFLICT (restaurant_id, month, year) DO NOTHING;

INSERT INTO featured_restaurants (restaurant_id, month, year, position)
SELECT id, EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 1
FROM restaurants WHERE slug = 'ristorante-bella-vita'
ON CONFLICT (restaurant_id, month, year) DO NOTHING;

INSERT INTO featured_restaurants (restaurant_id, month, year, position)
SELECT id, EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 2
FROM restaurants WHERE slug = 'sakura-sushi'
ON CONFLICT (restaurant_id, month, year) DO NOTHING;

INSERT INTO featured_restaurants (restaurant_id, month, year, position)
SELECT id, EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 3
FROM restaurants WHERE slug = 'chalet-alpin'
ON CONFLICT (restaurant_id, month, year) DO NOTHING;

INSERT INTO featured_restaurants (restaurant_id, month, year, position)
SELECT id, EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 4
FROM restaurants WHERE slug = 'el-gaucho-basel'
ON CONFLICT (restaurant_id, month, year) DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
