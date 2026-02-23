-- ============================================
-- Just-Tag.ch - Seed Data
-- Mock restaurants, reviews, menus for development
-- ============================================

-- ============================================
-- RESTAURANTS
-- ============================================

INSERT INTO restaurants (slug, name_fr, name_de, name_en, description_fr, description_de, description_en, cuisine_type, canton, city, address, postal_code, phone, email, website, price_range, features, cover_image, is_featured, is_published, opening_hours) VALUES

-- 1. Le Petit Prince - Geneva
('le-petit-prince',
  'Le Petit Prince',
  'Le Petit Prince',
  'Le Petit Prince',
  'Un joyau de la gastronomie francaise au coeur de Geneve. Notre chef etoile vous invite a un voyage culinaire exceptionnel avec des produits frais et de saison.',
  'Ein Juwel der franzosischen Gastronomie im Herzen von Genf. Unser Sternekoch ladt Sie zu einer aussergewohnlichen kulinarischen Reise mit frischen Saisonprodukten ein.',
  'A gem of French gastronomy in the heart of Geneva. Our starred chef invites you on an exceptional culinary journey with fresh seasonal products.',
  'francais', 'geneve', 'Geneve', 'Rue du Rhone 42', '1204',
  '+41 22 310 55 66', 'contact@lepetitprince.ch', 'https://lepetitprince.ch',
  '4', ARRAY['terrace', 'parking', 'wifi', 'accessible', 'vegetarian'],
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  true, true,
  '{"monday": {"open": "12:00", "close": "14:30"}, "tuesday": {"open": "12:00", "close": "14:30"}, "wednesday": {"open": "12:00", "close": "14:30"}, "thursday": {"open": "12:00", "close": "22:00"}, "friday": {"open": "12:00", "close": "22:30"}, "saturday": {"open": "18:00", "close": "23:00"}, "sunday": {"closed": true}}'
),

-- 2. Ristorante Bella Vita - Zurich
('ristorante-bella-vita',
  'Ristorante Bella Vita',
  'Ristorante Bella Vita',
  'Ristorante Bella Vita',
  'Authentique cuisine italienne preparee avec passion. Pates fraiches maison, pizzas au feu de bois et une carte des vins italiens exceptionnelle.',
  'Authentische italienische Kuche mit Leidenschaft zubereitet. Hausgemachte frische Pasta, Holzofenpizza und eine aussergewohnliche italienische Weinkarte.',
  'Authentic Italian cuisine prepared with passion. Homemade fresh pasta, wood-fired pizzas and an exceptional Italian wine list.',
  'italien', 'zurich', 'Zurich', 'Bahnhofstrasse 78', '8001',
  '+41 44 221 33 44', 'info@bellavita.ch', 'https://bellavita.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  true, true,
  '{"monday": {"open": "11:30", "close": "23:00"}, "tuesday": {"open": "11:30", "close": "23:00"}, "wednesday": {"open": "11:30", "close": "23:00"}, "thursday": {"open": "11:30", "close": "23:00"}, "friday": {"open": "11:30", "close": "23:30"}, "saturday": {"open": "12:00", "close": "23:30"}, "sunday": {"open": "12:00", "close": "22:00"}}'
),

-- 3. Sakura Sushi - Lausanne
('sakura-sushi',
  'Sakura Sushi',
  'Sakura Sushi',
  'Sakura Sushi',
  'Le meilleur sushi de Lausanne. Poissons frais importes quotidiennement du Japon, preparation traditionnelle devant vos yeux au comptoir omakase.',
  'Das beste Sushi in Lausanne. Taglich frisch aus Japan importierter Fisch, traditionelle Zubereitung vor Ihren Augen an der Omakase-Theke.',
  'The best sushi in Lausanne. Fish freshly imported daily from Japan, traditional preparation before your eyes at the omakase counter.',
  'japonais', 'vaud', 'Lausanne', 'Place de la Palud 15', '1003',
  '+41 21 312 88 99', 'reservation@sakurasushi.ch', 'https://sakurasushi.ch',
  '3', ARRAY['wifi', 'vegetarian', 'takeaway'],
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 4. Chalet Alpin - Zermatt
('chalet-alpin',
  'Chalet Alpin',
  'Chalet Alpin',
  'Chalet Alpin',
  'Cuisine suisse traditionnelle dans un cadre montagnard authentique. Fondue, raclette et specialites valaisannes avec vue imprenable sur le Cervin.',
  'Traditionelle Schweizer Kuche in einem authentischen Bergambiente. Fondue, Raclette und Walliser Spezialitaten mit atemberaubendem Blick auf das Matterhorn.',
  'Traditional Swiss cuisine in an authentic mountain setting. Fondue, raclette and Valais specialties with breathtaking views of the Matterhorn.',
  'suisse', 'valais', 'Zermatt', 'Bahnhofstrasse 22', '3920',
  '+41 27 966 11 22', 'info@chaletalpin.ch', 'https://chaletalpin.ch',
  '2', ARRAY['terrace', 'parking', 'accessible', 'kids-friendly', 'live-music'],
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  true, true,
  '{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "22:00"}}'
),

-- 5. Taj Mahal - Bern
('taj-mahal-bern',
  'Taj Mahal',
  'Taj Mahal',
  'Taj Mahal',
  'Les saveurs de l''Inde au coeur de Berne. Epices fraichement moulues, tandoori authentique et une selection de curries qui vous transporteront a Mumbai.',
  'Die Aromen Indiens im Herzen von Bern. Frisch gemahlene Gewurze, authentisches Tandoori und eine Auswahl an Currys, die Sie nach Mumbai entfuhren.',
  'The flavors of India in the heart of Bern. Freshly ground spices, authentic tandoori and a selection of curries that will transport you to Mumbai.',
  'indien', 'berne', 'Berne', 'Marktgasse 51', '3011',
  '+41 31 312 44 55', 'info@tajmahal-bern.ch', 'https://tajmahal-bern.ch',
  '2', ARRAY['wifi', 'vegetarian', 'vegan', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:30"}, "tuesday": {"open": "11:30", "close": "14:30"}, "wednesday": {"open": "11:30", "close": "14:30"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 6. El Gaucho - Basel
('el-gaucho-basel',
  'El Gaucho',
  'El Gaucho',
  'El Gaucho',
  'Steakhouse argentin premium a Bale. Viandes maturees, grillades au charbon de bois et une ambiance chaleureuse sud-americaine.',
  'Premium argentinisches Steakhouse in Basel. Gereifte Fleischsorten, Holzkohlegrills und eine warme sudamerikanische Atmosphare.',
  'Premium Argentinian steakhouse in Basel. Aged meats, charcoal grills and a warm South American atmosphere.',
  'argentin', 'bale-ville', 'Basel', 'Steinenberg 14', '4051',
  '+41 61 272 33 44', 'reservations@elgaucho.ch', 'https://elgaucho.ch',
  '3', ARRAY['terrace', 'parking', 'wifi', 'private-dining', 'live-music'],
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "18:00", "close": "23:00"}, "wednesday": {"open": "18:00", "close": "23:00"}, "thursday": {"open": "18:00", "close": "23:00"}, "friday": {"open": "18:00", "close": "23:30"}, "saturday": {"open": "12:00", "close": "23:30"}, "sunday": {"open": "12:00", "close": "22:00"}}'
),

-- 7. Bangkok Garden - Lucerne
('bangkok-garden',
  'Bangkok Garden',
  'Bangkok Garden',
  'Bangkok Garden',
  'Cuisine thai authentique au bord du lac des Quatre-Cantons. Pad Thai, curries parfumes et soupes Tom Yum preparees par notre chef thailandais.',
  'Authentische thailandische Kuche am Vierwaldstattersee. Pad Thai, duftende Currys und Tom-Yum-Suppen, zubereitet von unserem thailandischen Chefkoch.',
  'Authentic Thai cuisine by Lake Lucerne. Pad Thai, fragrant curries and Tom Yum soups prepared by our Thai chef.',
  'thai', 'lucerne', 'Lucerne', 'Seestrasse 8', '6003',
  '+41 41 210 55 66', 'info@bangkokgarden.ch', 'https://bangkokgarden.ch',
  '2', ARRAY['terrace', 'wifi', 'vegetarian', 'vegan', 'takeaway'],
  'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:30"}, "tuesday": {"open": "11:30", "close": "14:30"}, "wednesday": {"open": "11:30", "close": "22:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"closed": true}}'
),

-- 8. La Brasserie du Lac - Neuchatel
('la-brasserie-du-lac',
  'La Brasserie du Lac',
  'Brasserie am See',
  'The Lakeside Brasserie',
  'Une brasserie elegante sur les rives du lac de Neuchatel. Cuisine francaise revisitee avec des produits du terroir. Terrasse avec vue panoramique.',
  'Eine elegante Brasserie am Ufer des Neuenburgersees. Franzosische Kuche neu interpretiert mit regionalen Produkten. Terrasse mit Panoramablick.',
  'An elegant brasserie on the shores of Lake Neuchatel. French cuisine revisited with local products. Terrace with panoramic views.',
  'francais', 'neuchatel', 'Neuchatel', 'Quai Osterwald 12', '2000',
  '+41 32 725 11 22', 'contact@brasseriedulac.ch', 'https://brasseriedulac.ch',
  '3', ARRAY['terrace', 'parking', 'wifi', 'accessible', 'private-dining', 'lake-view'],
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:30"}, "wednesday": {"open": "12:00", "close": "14:30"}, "thursday": {"open": "12:00", "close": "22:00"}, "friday": {"open": "12:00", "close": "22:30"}, "saturday": {"open": "11:30", "close": "23:00"}, "sunday": {"open": "11:30", "close": "21:00"}}'
);

-- ============================================
-- RESTAURANT IMAGES
-- ============================================

-- Le Petit Prince images
INSERT INTO restaurant_images (restaurant_id, url, alt_text, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'Interior dining room', 0),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 'Elegant table setting', 1),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', 'Signature dish', 2),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', 'Wine cellar', 3);

-- Ristorante Bella Vita images
INSERT INTO restaurant_images (restaurant_id, url, alt_text, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Restaurant interior', 0),
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Wood-fired pizza', 1),
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800', 'Fresh pasta', 2);

-- Sakura Sushi images
INSERT INTO restaurant_images (restaurant_id, url, alt_text, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 'Sushi platter', 0),
  ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', 'Omakase counter', 1),
  ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800', 'Sashimi selection', 2);

-- Chalet Alpin images
INSERT INTO restaurant_images (restaurant_id, url, alt_text, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 'Traditional Swiss chalet', 0),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800', 'Fondue preparation', 1),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800', 'Mountain view terrace', 2);

-- ============================================
-- REVIEWS
-- ============================================

-- Le Petit Prince reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Marie D.', 5, 'Une experience gastronomique inoubliable. Le menu degustation est un pur chef-d''oeuvre. Service impeccable.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Thomas W.', 4, 'Excellente cuisine, presentation magnifique. Un peu bruyant le vendredi soir mais la qualite est au rendez-vous.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Sophie L.', 5, 'Le meilleur restaurant francais de Geneve, sans hesitation. La terrine de foie gras est divine.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Hans M.', 5, 'Erstklassig! Die Weinkarte ist beeindruckend und der Service aufmerksam ohne aufdringlich zu sein.');

-- Ristorante Bella Vita reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'Anna K.', 5, 'Die besten Pasta in Zurich! Alles frisch und hausgemacht. Die Carbonara ist ein Traum.'),
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'Pierre G.', 4, 'Tres bonne pizza napolitaine. La pate est parfaite, croustillante et moelleuse a la fois.'),
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), 'James R.', 5, 'Authentic Italian at its best. The truffle risotto was incredible.');

-- Sakura Sushi reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), 'Yuki T.', 5, 'Enfin un vrai sushi de qualite en Suisse! Le poisson est d''une fraicheur exceptionnelle.'),
  ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), 'Laurent B.', 4, 'Le menu omakase vaut vraiment le detour. Rapport qualite-prix correct pour ce niveau.');

-- Chalet Alpin reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Clara S.', 5, 'La meilleure fondue que j''ai mangee! Cadre magnifique avec vue sur le Cervin. Incontournable a Zermatt.'),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Michael B.', 4, 'Great Swiss traditional food in a cozy mountain setting. The raclette was superb.'),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Isabelle F.', 5, 'Ambiance chaleureuse, cuisine genereuse et authentique. On se sent comme a la maison.');

-- Taj Mahal reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'taj-mahal-bern'), 'Priya S.', 5, 'Reminds me of home! The butter chicken and naan bread are absolutely authentic.'),
  ((SELECT id FROM restaurants WHERE slug = 'taj-mahal-bern'), 'Stefan K.', 4, 'Sehr gutes indisches Essen. Das Chicken Tikka Masala ist fantastisch.');

-- El Gaucho reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'el-gaucho-basel'), 'Roberto M.', 5, 'The best steak I''ve had in Switzerland. The Argentinian beef is perfectly aged and grilled.'),
  ((SELECT id FROM restaurants WHERE slug = 'el-gaucho-basel'), 'Nathalie P.', 4, 'Excellente viande, ambiance sympa. Les empanadas en entree sont delicieux.');

-- Bangkok Garden reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'bangkok-garden'), 'Lisa H.', 4, 'Authentic Thai flavors by the lake. The green curry is perfectly balanced.'),
  ((SELECT id FROM restaurants WHERE slug = 'bangkok-garden'), 'Marc D.', 5, 'Le Pad Thai est excellent et les prix sont tres raisonnables pour Lucerne.');

-- La Brasserie du Lac reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'la-brasserie-du-lac'), 'Catherine V.', 4, 'Belle terrasse avec vue sur le lac. Le filet de perche est frais et bien prepare.'),
  ((SELECT id FROM restaurants WHERE slug = 'la-brasserie-du-lac'), 'Jean-Pierre M.', 5, 'Un classique de Neuchatel. La cuisine est raffinee et le service attentionne.');

-- ============================================
-- MENU ITEMS (sample for Le Petit Prince and Chalet Alpin)
-- ============================================

-- Le Petit Prince menu
INSERT INTO menu_items (restaurant_id, name_fr, name_de, name_en, description_fr, price, category, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Terrine de foie gras', 'Foie Gras Terrine', 'Foie Gras Terrine', 'Terrine maison, chutney de figues, pain briche toaste', 32.00, 'entrees', 0),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Tartare de saumon', 'Lachstartar', 'Salmon Tartare', 'Saumon frais, avocat, agrumes, huile de sesame', 28.00, 'entrees', 1),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Soupe a l''oignon', 'Zwiebelsuppe', 'French Onion Soup', 'Gratinee au gruyere AOP', 18.00, 'entrees', 2),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Filet de boeuf Rossini', 'Rinderfilet Rossini', 'Beef Filet Rossini', 'Filet de boeuf, foie gras poele, sauce aux truffes', 62.00, 'plats', 3),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Sole meuniere', 'Seezunge Mullerin', 'Sole Meuniere', 'Sole entiere, beurre noisette, capres, citron', 55.00, 'plats', 4),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Canard confit', 'Entenconfit', 'Duck Confit', 'Cuisse de canard confite, pommes sarladaises', 45.00, 'plats', 5),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Creme brulee', 'Creme Brulee', 'Creme Brulee', 'A la vanille de Madagascar', 16.00, 'desserts', 6),
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), 'Tarte Tatin', 'Tarte Tatin', 'Tarte Tatin', 'Pommes caramelisees, creme fraiche', 18.00, 'desserts', 7);

-- Chalet Alpin menu
INSERT INTO menu_items (restaurant_id, name_fr, name_de, name_en, description_fr, price, category, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Fondue moitie-moitie', 'Fondue halb-halb', 'Half-and-half Fondue', 'Gruyere AOP et Vacherin Fribourgeois, pain', 28.00, 'fondues', 0),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Fondue aux truffes', 'Truffelfondue', 'Truffle Fondue', 'Fondue au fromage enrichie de truffes noires', 38.00, 'fondues', 1),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Raclette traditionnelle', 'Traditionelles Raclette', 'Traditional Raclette', 'Fromage a raclette du Valais, pommes de terre, cornichons', 32.00, 'raclettes', 2),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Rosti bernois', 'Berner Rosti', 'Bernese Rosti', 'Rosti croustillant avec lard, oeuf et fromage', 24.00, 'plats', 3),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Saucisse de veau', 'Kalbsbratwurst', 'Veal Sausage', 'Saucisse artisanale avec rosti et sauce a l''oignon', 26.00, 'plats', 4),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), 'Meringues double creme', 'Meringues mit Doppelrahm', 'Meringues with Double Cream', 'Meringues de Gruyere et creme de la Gruyere', 14.00, 'desserts', 5);

-- ============================================
-- FEATURED RESTAURANTS (for current month)
-- ============================================

INSERT INTO featured_restaurants (restaurant_id, month, year, position) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-petit-prince'), EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 0),
  ((SELECT id FROM restaurants WHERE slug = 'ristorante-bella-vita'), EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 1),
  ((SELECT id FROM restaurants WHERE slug = 'sakura-sushi'), EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 2),
  ((SELECT id FROM restaurants WHERE slug = 'chalet-alpin'), EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 3),
  ((SELECT id FROM restaurants WHERE slug = 'el-gaucho-basel'), EXTRACT(MONTH FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer, 4);
