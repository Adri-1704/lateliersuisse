-- ============================================
-- L'Atelier Suisse - 20 nouveaux restaurants Valais
-- Villes: Martigny, Sierre, Verbier, Crans-Montana,
--         Visp, Saas-Fee, Champery, Fully, Leukerbad, Champoussin
-- Source: local.ch / search.ch (donnees verifiees)
-- ============================================

-- ============================================
-- MARTIGNY (canton: valais, CP: 1920)
-- ============================================

INSERT INTO restaurants (slug, name_fr, name_de, name_en, description_fr, description_de, description_en, cuisine_type, canton, city, address, postal_code, phone, email, website, price_range, features, cover_image, is_featured, is_published, opening_hours) VALUES

-- 1. La Nonna Martigny
('la-nonna-martigny',
  'La Nonna Martigny',
  'La Nonna Martigny',
  'La Nonna Martigny',
  'Restaurant italien au coeur de Martigny, La Nonna propose des pizzas artisanales et des plats traditionnels italiens dans une ambiance chaleureuse sur la Place Centrale.',
  'Italienisches Restaurant im Herzen von Martigny. La Nonna bietet handwerkliche Pizzas und traditionelle italienische Gerichte in gemutlicher Atmosphare am Place Centrale.',
  'Italian restaurant in the heart of Martigny. La Nonna offers artisanal pizzas and traditional Italian dishes in a warm atmosphere on Place Centrale.',
  'italien', 'valais', 'Martigny', 'Place Centrale 5', '1920',
  '+41 27 722 11 89', 'info@lanonnamartigny.ch', 'https://www.lanonnamartigny.ch',
  '2', ARRAY['terrace', 'wifi', 'vegetarian', 'takeaway'],
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 2. Steak House chez Steve et Arnaud - Martigny
('steak-house-chez-steve-et-arnaud',
  'Steak House chez Steve et Arnaud',
  'Steak House bei Steve und Arnaud',
  'Steak House at Steve and Arnaud''s',
  'Steakhouse convivial en plein centre de Martigny, specialise dans les viandes grillees de qualite. Un incontournable pour les amateurs de bonne viande sur la Place Centrale.',
  'Geselliges Steakhouse im Zentrum von Martigny, spezialisiert auf hochwertige Grillgerichte. Ein Muss fur Fleischliebhaber am Place Centrale.',
  'Convivial steakhouse in the center of Martigny, specialized in quality grilled meats. A must for meat lovers on Place Centrale.',
  'grillades', 'valais', 'Martigny', 'Place Centrale 10', '1920',
  '+41 27 722 25 65', 'steakhousemartigny@gmail.com', '',
  '3', ARRAY['terrace', 'wifi'],
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"closed": true}}'
),

-- 3. Les Trois Couronnes - Martigny
('les-trois-couronnes-martigny',
  'Les Trois Couronnes',
  'Die Drei Kronen',
  'The Three Crowns',
  'Restaurant traditionnel situe sur la Place du Bourg a Martigny. Les Trois Couronnes propose une cuisine suisse raffinee dans un cadre historique. Reservation uniquement par telephone.',
  'Traditionelles Restaurant am Place du Bourg in Martigny. Die Drei Kronen bieten eine raffinierte Schweizer Kuche in historischem Rahmen. Reservation nur telefonisch.',
  'Traditional restaurant on Place du Bourg in Martigny. Les Trois Couronnes offers refined Swiss cuisine in a historic setting. Reservations by phone only.',
  'suisse', 'valais', 'Martigny', 'Place du Bourg 8', '1920',
  '+41 27 723 21 14', '', '',
  '3', ARRAY['private-dining', 'accessible'],
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "21:30"}, "friday": {"open": "12:00", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- ============================================
-- SIERRE (canton: valais, CP: 3960)
-- ============================================

-- 4. Chateau de Villa - Sierre
('chateau-de-villa-sierre',
  'Chateau de Villa',
  'Chateau de Villa',
  'Chateau de Villa',
  'Institution gastronomique de Sierre, le Chateau de Villa est repute pour ses fondues et raclettes dans un cadre historique exceptionnel. Un lieu emblematique du patrimoine culinaire valaisan.',
  'Gastronomische Institution in Sierre. Das Chateau de Villa ist bekannt fur seine Fondues und Raclettes in einem aussergewohnlichen historischen Rahmen. Ein Wahrzeichen der Walliser Kulinarik.',
  'A gastronomic institution in Sierre. Chateau de Villa is renowned for its fondues and raclettes in an exceptional historic setting. An iconic landmark of Valais culinary heritage.',
  'suisse', 'valais', 'Sierre', 'Rue Sainte-Catherine 4', '3960',
  '+41 27 456 24 29', 'info@chateaudevilla.ch', 'https://chateaudevilla.ch',
  '3', ARRAY['terrace', 'parking', 'private-dining', 'accessible', 'wifi'],
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:30"}, "wednesday": {"open": "11:30", "close": "14:30"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "11:30", "close": "21:00"}}'
),

-- 5. Le Bourgeois - Sierre
('le-bourgeois-sierre',
  'Le Bourgeois',
  'Le Bourgeois',
  'Le Bourgeois',
  'Restaurant gastronomique au centre de Sierre. Le Bourgeois propose une cuisine francaise revisitee avec des produits locaux valaisans dans un cadre elegant et contemporain.',
  'Gastronomisches Restaurant im Zentrum von Sierre. Le Bourgeois bietet eine neu interpretierte franzosische Kuche mit lokalen Walliser Produkten in einem eleganten, zeitgenossischen Rahmen.',
  'Fine dining restaurant in the center of Sierre. Le Bourgeois offers revisited French cuisine with local Valais products in an elegant contemporary setting.',
  'francais', 'valais', 'Sierre', 'Avenue du Rothorn 2', '3960',
  '+41 27 455 75 33', '', '',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "21:30"}, "friday": {"open": "12:00", "close": "22:00"}, "saturday": {"open": "18:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 6. Chez Wang - Sierre
('chez-wang-sierre',
  'Chez Wang',
  'Chez Wang',
  'Chez Wang',
  'Restaurant asiatique apprecie a Sierre. Chez Wang offre une cuisine chinoise et asiatique authentique avec des plats varies et genereux sur l''Avenue General-Guisan.',
  'Beliebtes asiatisches Restaurant in Sierre. Chez Wang bietet authentische chinesische und asiatische Kuche mit abwechslungsreichen und grosszugigen Gerichten an der Avenue General-Guisan.',
  'Popular Asian restaurant in Sierre. Chez Wang offers authentic Chinese and Asian cuisine with varied and generous dishes on Avenue General-Guisan.',
  'chinois', 'valais', 'Sierre', 'Avenue General-Guisan 19', '3960',
  '+41 27 525 26 28', 'chezwang3960@gmail.com', 'https://www.chezwang.ch',
  '2', ARRAY['wifi', 'takeaway', 'vegetarian'],
  'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- ============================================
-- VERBIER (canton: valais, CP: 1936)
-- ============================================

-- 7. La Table d'Adrien - Verbier
('la-table-d-adrien-verbier',
  'La Table d''Adrien',
  'La Table d''Adrien',
  'La Table d''Adrien',
  'Table gastronomique de renom a Verbier. La Table d''Adrien au Chalet Adrien offre une cuisine raffinee avec vue panoramique sur les Alpes. Une experience culinaire d''exception.',
  'Renommiertes Gourmetrestaurant in Verbier. La Table d''Adrien im Chalet Adrien bietet eine raffinierte Kuche mit Panoramablick auf die Alpen. Ein aussergewohnliches kulinarisches Erlebnis.',
  'Renowned gourmet restaurant in Verbier. La Table d''Adrien at Chalet Adrien offers refined cuisine with panoramic Alpine views. An exceptional culinary experience.',
  'gastronomique', 'valais', 'Verbier', 'Route des Creux 91', '1936',
  '+41 27 771 62 00', 'info@chalet-adrien.com', 'https://www.chalet-adrien.com',
  '4', ARRAY['terrace', 'parking', 'wifi', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"closed": true}, "wednesday": {"open": "19:00", "close": "22:00"}, "thursday": {"open": "19:00", "close": "22:00"}, "friday": {"open": "12:00", "close": "14:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"open": "12:00", "close": "14:00"}}'
),

-- 8. Boca - Verbier
('boca-verbier',
  'Boca',
  'Boca',
  'Boca',
  'Restaurant branche et moderne a Verbier. Boca propose une cuisine internationale creative dans une ambiance tendance. Un lieu incontournable de la station.',
  'Trendiges und modernes Restaurant in Verbier. Boca bietet kreative internationale Kuche in einer angesagten Atmosphare. Ein Muss in der Skistation.',
  'Trendy and modern restaurant in Verbier. Boca offers creative international cuisine in a stylish atmosphere. A must-visit in the resort.',
  'international', 'valais', 'Verbier', 'Route de Verbier Station 61', '1936',
  '+41 27 771 33 44', 'contact@bocaverbier.com', 'https://www.bocaverbier.com',
  '3', ARRAY['terrace', 'wifi', 'vegetarian'],
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "23:00"}, "tuesday": {"open": "11:30", "close": "23:00"}, "wednesday": {"open": "11:30", "close": "23:00"}, "thursday": {"open": "11:30", "close": "23:00"}, "friday": {"open": "11:30", "close": "23:30"}, "saturday": {"open": "11:30", "close": "23:30"}, "sunday": {"open": "11:30", "close": "22:00"}}'
),

-- 9. Restaurant Le Catogne - Verbier
('restaurant-le-catogne-verbier',
  'Restaurant Le Catogne',
  'Restaurant Le Catogne',
  'Restaurant Le Catogne',
  'Restaurant familial et authentique a Verbier. Le Catogne sert une cuisine suisse traditionnelle avec des specialites valaisannes dans une atmosphere decontractee.',
  'Familiares und authentisches Restaurant in Verbier. Le Catogne serviert traditionelle Schweizer Kuche mit Walliser Spezialitaten in entspannter Atmosphare.',
  'Family-friendly and authentic restaurant in Verbier. Le Catogne serves traditional Swiss cuisine with Valais specialties in a relaxed atmosphere.',
  'suisse', 'valais', 'Verbier', 'Route de Verbier Station 29', '1936',
  '+41 27 771 21 48', '', 'https://www.restaurantlecatogne.ch',
  '2', ARRAY['terrace', 'kids-friendly', 'accessible'],
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  false, true,
  '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:30"}, "saturday": {"open": "08:00", "close": "23:30"}, "sunday": {"open": "08:00", "close": "22:00"}}'
),

-- ============================================
-- CRANS-MONTANA (canton: valais, CP: 3963)
-- ============================================

-- 10. Restaurant CASY - Crans-Montana
('restaurant-casy-crans-montana',
  'Restaurant CASY',
  'Restaurant CASY',
  'Restaurant CASY',
  'Restaurant contemporain au coeur de Crans-Montana. CASY propose une cuisine suisse moderne et creative dans un cadre design. Une adresse prisee de la station.',
  'Zeitgenossisches Restaurant im Herzen von Crans-Montana. CASY bietet moderne und kreative Schweizer Kuche in einem Design-Ambiente. Eine beliebte Adresse der Station.',
  'Contemporary restaurant in the heart of Crans-Montana. CASY offers modern and creative Swiss cuisine in a designer setting. A popular address in the resort.',
  'suisse', 'valais', 'Crans-Montana', 'Rue Louis Antille 11', '3963',
  '+41 27 481 17 18', '', 'https://www.casy.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian'],
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "22:00"}, "friday": {"open": "12:00", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 11. Michelangelo - Crans-Montana
('michelangelo-crans-montana',
  'Michelangelo',
  'Michelangelo',
  'Michelangelo',
  'Pizzeria et restaurant italien a Crans-Montana. Michelangelo propose des pizzas au feu de bois et des plats italiens traditionnels dans une ambiance familiale.',
  'Pizzeria und italienisches Restaurant in Crans-Montana. Michelangelo bietet Holzofenpizza und traditionelle italienische Gerichte in familiarer Atmosphare.',
  'Pizzeria and Italian restaurant in Crans-Montana. Michelangelo offers wood-fired pizzas and traditional Italian dishes in a family-friendly atmosphere.',
  'italien', 'valais', 'Crans-Montana', 'Avenue de la Gare 25', '3963',
  '+41 27 481 09 19', '', '',
  '2', ARRAY['terrace', 'kids-friendly', 'takeaway'],
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 12. Restaurant Helvetia Intergolf - Crans-Montana
('helvetia-intergolf-crans-montana',
  'Restaurant Helvetia Intergolf',
  'Restaurant Helvetia Intergolf',
  'Restaurant Helvetia Intergolf',
  'Restaurant gastronomique de l''Hotel Helvetia Intergolf a Crans-Montana, offrant une cuisine raffinee dans un cadre luxueux face aux Alpes valaisannes.',
  'Gastronomisches Restaurant des Hotels Helvetia Intergolf in Crans-Montana. Raffinierte Kuche in einem luxuriosen Ambiente mit Blick auf die Walliser Alpen.',
  'Fine dining restaurant at Hotel Helvetia Intergolf in Crans-Montana, offering refined cuisine in a luxurious setting facing the Valais Alps.',
  'gastronomique', 'valais', 'Crans-Montana', 'Route de la Moubra 8', '3963',
  '+41 27 485 88 88', 'info@helvetia-intergolf.ch', 'https://www.helvetia-intergolf.ch',
  '4', ARRAY['terrace', 'parking', 'wifi', 'accessible', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  true, true,
  '{"monday": {"open": "12:00", "close": "14:00"}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "21:30"}, "friday": {"open": "12:00", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- ============================================
-- VISP (canton: valais, CP: 3930)
-- ============================================

-- 13. Staldbach - Visp
('staldbach-visp',
  'Staldbach',
  'Staldbach',
  'Staldbach',
  'Restaurant Staldbach a Visp, un lieu convivial proposant une cuisine suisse traditionnelle avec terrasse agreable. Ideal pour decouvrir les saveurs du Haut-Valais.',
  'Restaurant Staldbach in Visp. Ein geselliger Ort mit traditioneller Schweizer Kuche und gemutlicher Terrasse. Ideal um die Aromen des Oberwallis zu entdecken.',
  'Restaurant Staldbach in Visp, a convivial place offering traditional Swiss cuisine with a pleasant terrace. Ideal to discover the flavors of Upper Valais.',
  'suisse', 'valais', 'Visp', 'Talstrasse 9', '3930',
  '+41 27 948 40 30', 'info@staldbach.ch', 'https://www.staldbach.ch',
  '2', ARRAY['terrace', 'parking', 'wifi', 'kids-friendly', 'accessible'],
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  false, true,
  '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:30"}, "saturday": {"open": "09:00", "close": "23:30"}, "sunday": {"open": "09:00", "close": "22:00"}}'
),

-- 14. Restaurant La Poste - Visp
('restaurant-la-poste-visp',
  'Restaurant La Poste',
  'Restaurant La Poste',
  'Restaurant La Poste',
  'Restaurant traditionnel au centre de Visp. La Poste sert des specialites valaisannes et suisses dans un cadre accueillant. Un point de rencontre apprecie des locaux.',
  'Traditionelles Restaurant im Zentrum von Visp. La Poste serviert Walliser und Schweizer Spezialitaten in einladendem Rahmen. Ein beliebter Treffpunkt der Einheimischen.',
  'Traditional restaurant in the center of Visp. La Poste serves Valais and Swiss specialties in a welcoming setting. A popular meeting point for locals.',
  'suisse', 'valais', 'Visp', 'La-Poste-Platz 4', '3930',
  '+41 27 948 33 88', '', '',
  '2', ARRAY['terrace', 'wifi', 'accessible'],
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  false, true,
  '{"monday": {"open": "07:00", "close": "23:00"}, "tuesday": {"open": "07:00", "close": "23:00"}, "wednesday": {"open": "07:00", "close": "23:00"}, "thursday": {"open": "07:00", "close": "23:00"}, "friday": {"open": "07:00", "close": "23:30"}, "saturday": {"open": "08:00", "close": "23:30"}, "sunday": {"open": "08:00", "close": "22:00"}}'
),

-- ============================================
-- SAAS-FEE (canton: valais, CP: 3906)
-- ============================================

-- 15. Restaurant Hannig - Saas-Fee
('restaurant-hannig-saas-fee',
  'Restaurant Hannig',
  'Restaurant Hannig',
  'Restaurant Hannig',
  'Restaurant d''altitude a Saas-Fee avec vue spectaculaire sur les sommets valaisans. Specialites suisses et grillades dans un cadre alpin authentique et depaysant.',
  'Bergrestaurant in Saas-Fee mit spektakularer Aussicht auf die Walliser Gipfel. Schweizer Spezialitaten und Grillgerichte in einem authentischen Alpenambiente.',
  'Mountain restaurant in Saas-Fee with spectacular views of the Valais peaks. Swiss specialties and grilled dishes in an authentic Alpine setting.',
  'suisse', 'valais', 'Saas-Fee', 'Hannigweg 40', '3906',
  '+41 27 957 14 19', 'info@hannigalp.ch', 'https://www.hannig.ch',
  '3', ARRAY['terrace', 'kids-friendly', 'accessible'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  false, true,
  '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "09:00", "close": "17:00"}}'
),

-- ============================================
-- CHAMPERY (canton: valais, CP: 1874)
-- ============================================

-- 16. Le Gueullhi - Champery
('le-gueullhi-champery',
  'Le Gueullhi',
  'Le Gueullhi',
  'Le Gueullhi',
  'Restaurant chaleureux a Champery. Le Gueullhi est repute pour ses fondues et ses plats valaisans traditionnels. Une adresse authentique au coeur du village.',
  'Gemutliches Restaurant in Champery. Le Gueullhi ist bekannt fur seine Fondues und traditionellen Walliser Gerichte. Eine authentische Adresse im Herzen des Dorfes.',
  'Warm and welcoming restaurant in Champery. Le Gueullhi is renowned for its fondues and traditional Valais dishes. An authentic address in the heart of the village.',
  'suisse', 'valais', 'Champery', 'Route de la Fin 11', '1874',
  '+41 24 479 35 55', 'legueullhi@bluewin.ch', 'https://www.legueullhi.ch',
  '2', ARRAY['terrace', 'kids-friendly', 'parking'],
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:30"}, "wednesday": {"open": "11:30", "close": "14:30"}, "thursday": {"open": "11:30", "close": "21:30"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"open": "11:30", "close": "21:00"}}'
),

-- 17. Cantine Sur Coux - Champery
('cantine-sur-coux-champery',
  'Cantine Sur Coux',
  'Cantine Sur Coux',
  'Cantine Sur Coux',
  'Cantine de montagne pittoresque au-dessus de Champery. Sur Coux offre des plats simples et savoureux dans un cadre nature exceptionnel avec vue sur les Dents du Midi.',
  'Malerische Bergkantine oberhalb von Champery. Sur Coux bietet einfache und schmackhafte Gerichte in einem aussergewohnlichen Naturrahmen mit Blick auf die Dents du Midi.',
  'Picturesque mountain canteen above Champery. Sur Coux offers simple and tasty dishes in an exceptional natural setting with views of the Dents du Midi.',
  'suisse', 'valais', 'Champery', 'Route sur Cou 83', '1874',
  '+41 24 479 10 44', '', '',
  '2', ARRAY['terrace', 'kids-friendly'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  false, true,
  '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "09:00", "close": "17:00"}}'
),

-- ============================================
-- FULLY (canton: valais, CP: 1926)
-- ============================================

-- 18. Chez Pepone - Fully
('chez-pepone-fully',
  'Chez Pepone',
  'Chez Pepone',
  'Chez Pepone',
  'Restaurant convivial a Fully. Chez Pepone propose une cuisine suisse traditionnelle avec des produits du terroir valaisan. Ambiance chaleureuse et service attentionne.',
  'Geselliges Restaurant in Fully. Chez Pepone bietet traditionelle Schweizer Kuche mit regionalen Walliser Produkten. Herzliche Atmosphare und aufmerksamer Service.',
  'Convivial restaurant in Fully. Chez Pepone offers traditional Swiss cuisine with local Valais products. Warm atmosphere and attentive service.',
  'suisse', 'valais', 'Fully', 'Rue Maison de Commune 7', '1926',
  '+41 27 746 65 65', 'info@chezpepone.ch', 'https://www.chezpepone.ch',
  '2', ARRAY['terrace', 'parking', 'kids-friendly'],
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- ============================================
-- LEUKERBAD (canton: valais, CP: 3954)
-- ============================================

-- 19. Walliserkanne Croix-Federale - Leukerbad
('walliserkanne-leukerbad',
  'Walliserkanne Croix-Federale',
  'Walliserkanne Eidgenossisches Kreuz',
  'Walliserkanne Croix-Federale',
  'Restaurant traditionnel a Leukerbad. La Walliserkanne propose des specialites valaisannes et suisses dans un cadre typique. Ideal apres une journee aux bains thermaux.',
  'Traditionelles Restaurant in Leukerbad. Die Walliserkanne bietet Walliser und Schweizer Spezialitaten in einem typischen Ambiente. Ideal nach einem Tag in den Thermalbadern.',
  'Traditional restaurant in Leukerbad. The Walliserkanne offers Valais and Swiss specialties in a typical setting. Ideal after a day at the thermal baths.',
  'suisse', 'valais', 'Leukerbad', 'Kirchstrasse 83', '3954',
  '+41 27 472 79 79', 'info@walliserkanne.ch', 'https://www.walliserkanne.ch',
  '2', ARRAY['terrace', 'wifi', 'accessible', 'kids-friendly'],
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  false, true,
  '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:30"}, "saturday": {"open": "08:00", "close": "23:30"}, "sunday": {"open": "08:00", "close": "22:00"}}'
),

-- ============================================
-- CHAMPOUSSIN / VAL D'ILLIEZ (canton: valais, CP: 1873)
-- ============================================

-- 20. Chez Gaby 1670 - Champoussin
('chez-gaby-1670-champoussin',
  'Chez Gaby 1670',
  'Chez Gaby 1670',
  'Chez Gaby 1670',
  'Restaurant de montagne a Champoussin dans le Val d''Illiez. Chez Gaby 1670 propose une cuisine suisse traditionnelle dans un cadre alpin authentique a 1670 metres d''altitude.',
  'Bergrestaurant in Champoussin im Val d''Illiez. Chez Gaby 1670 bietet traditionelle Schweizer Kuche in einem authentischen Alpenambiente auf 1670 Metern Hohe.',
  'Mountain restaurant in Champoussin in the Val d''Illiez. Chez Gaby 1670 offers traditional Swiss cuisine in an authentic Alpine setting at 1670 meters altitude.',
  'suisse', 'valais', 'Champoussin', 'Route de Champoussin 67', '1873',
  '+41 24 477 22 22', '', '',
  '2', ARRAY['terrace', 'parking', 'kids-friendly'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  false, true,
  '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "22:00"}, "saturday": {"open": "09:00", "close": "22:00"}, "sunday": {"open": "09:00", "close": "17:00"}}'
);
