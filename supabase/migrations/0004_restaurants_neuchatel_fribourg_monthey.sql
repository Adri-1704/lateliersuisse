-- ============================================
-- Just-Tag.app - 30 nouveaux restaurants
-- 10 Neuchatel, 10 Fribourg, 10 Monthey
-- ============================================

-- ============================================
-- NEUCHATEL (canton: neuchatel, CP: 2000)
-- ============================================

INSERT INTO restaurants (slug, name_fr, name_de, name_en, description_fr, description_de, description_en, cuisine_type, canton, city, address, postal_code, phone, email, website, price_range, features, cover_image, is_featured, is_published, opening_hours) VALUES

-- 1. Le Cafe du Cerf - Neuchatel
('le-cafe-du-cerf-neuchatel',
  'Le Cafe du Cerf',
  'Cafe zum Hirsch',
  'The Stag Cafe',
  'Institution neuchateloise depuis 1920. Cuisine suisse traditionnelle et specialites du terroir dans un cadre historique au coeur de la vieille ville.',
  'Neuenburger Institution seit 1920. Traditionelle Schweizer Kuche und regionale Spezialitaten in einem historischen Rahmen im Herzen der Altstadt.',
  'A Neuchatel institution since 1920. Traditional Swiss cuisine and regional specialties in a historic setting in the heart of the old town.',
  'suisse', 'neuchatel', 'Neuchatel', 'Rue du Seyon 8', '2000',
  '+41 32 725 22 33', 'info@cafeducerf.ch', 'https://cafeducerf.ch',
  '2', ARRAY['terrace', 'wifi', 'accessible', 'kids-friendly'],
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  false, true,
  '{"monday": {"open": "08:00", "close": "23:00"}, "tuesday": {"open": "08:00", "close": "23:00"}, "wednesday": {"open": "08:00", "close": "23:00"}, "thursday": {"open": "08:00", "close": "23:00"}, "friday": {"open": "08:00", "close": "23:30"}, "saturday": {"open": "09:00", "close": "23:30"}, "sunday": {"open": "09:00", "close": "22:00"}}'
),

-- 2. Da Vinci Ristorante - Neuchatel
('da-vinci-neuchatel',
  'Da Vinci Ristorante',
  'Da Vinci Ristorante',
  'Da Vinci Ristorante',
  'Cuisine italienne authentique au bord du lac de Neuchatel. Pates fraiches faites maison chaque jour et pizzas cuites au four a bois.',
  'Authentische italienische Kuche am Neuenburgersee. Taglich frisch hausgemachte Pasta und Holzofenpizza.',
  'Authentic Italian cuisine by Lake Neuchatel. Fresh homemade pasta made daily and wood-fired pizzas.',
  'italien', 'neuchatel', 'Neuchatel', 'Quai Leopold-Robert 4', '2000',
  '+41 32 724 55 66', 'info@davinci-neuchatel.ch', 'https://davinci-neuchatel.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'lake-view', 'takeaway'],
  'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 3. Le Poisson Rouge - Neuchatel
('le-poisson-rouge-neuchatel',
  'Le Poisson Rouge',
  'Der Rote Fisch',
  'The Red Fish',
  'Restaurant de fruits de mer et poissons du lac. Filets de perche, bondelle et specialites lacustres dans une ambiance maritime raffinee.',
  'Fisch- und Meeresfruchterestaurant mit Seefisch. Eglifilets, Bondelle und Seespezialitaten in einem raffinierten maritimen Ambiente.',
  'Seafood and lake fish restaurant. Perch fillets, bondelle and lake specialties in a refined maritime atmosphere.',
  'fruits-de-mer', 'neuchatel', 'Neuchatel', 'Rue des Epancheurs 16', '2000',
  '+41 32 730 11 22', 'contact@lepoissonrouge.ch', 'https://lepoissonrouge.ch',
  '3', ARRAY['terrace', 'wifi', 'accessible', 'private-dining', 'lake-view'],
  'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "21:30"}, "friday": {"open": "12:00", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"open": "11:30", "close": "21:00"}}'
),

-- 4. Chez Ming - Neuchatel
('chez-ming-neuchatel',
  'Chez Ming',
  'Chez Ming',
  'Chez Ming',
  'Cuisine chinoise traditionnelle et dim sum faits maison. Le chef Ming propose des plats du Sichuan et de Canton dans un decor elegant et moderne.',
  'Traditionelle chinesische Kuche und hausgemachte Dim Sum. Chefkoch Ming bietet Gerichte aus Sichuan und Kanton in einem eleganten, modernen Dekor.',
  'Traditional Chinese cuisine and homemade dim sum. Chef Ming offers Sichuan and Cantonese dishes in an elegant, modern setting.',
  'chinois', 'neuchatel', 'Neuchatel', 'Rue de l''Hopital 11', '2000',
  '+41 32 721 88 99', 'reservation@chezming.ch', 'https://chezming.ch',
  '2', ARRAY['wifi', 'vegetarian', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 5. L''Escale Gourmande - Neuchatel
('escale-gourmande-neuchatel',
  'L''Escale Gourmande',
  'Die Gourmet-Haltestelle',
  'The Gourmet Stopover',
  'Restaurant gastronomique avec menu degustation et carte des vins exceptionnelle. Produits locaux sublimes par notre chef dans un cadre raffine.',
  'Gourmetrestaurant mit Degustationsmenu und aussergewohnlicher Weinkarte. Lokale Produkte, veredelt von unserem Chefkoch in einem raffinierten Ambiente.',
  'Fine dining restaurant with tasting menu and exceptional wine list. Local products elevated by our chef in a refined setting.',
  'gastronomique', 'neuchatel', 'Neuchatel', 'Faubourg du Lac 21', '2000',
  '+41 32 722 44 55', 'reservation@escalegourmande.ch', 'https://escalegourmande.ch',
  '4', ARRAY['wifi', 'accessible', 'private-dining', 'vegetarian', 'parking'],
  'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"closed": true}, "wednesday": {"open": "19:00", "close": "22:00"}, "thursday": {"open": "12:00", "close": "14:00"}, "friday": {"open": "12:00", "close": "14:00"}, "saturday": {"open": "19:00", "close": "22:30"}, "sunday": {"closed": true}}'
),

-- 6. Pizza del Porto - Neuchatel
('pizza-del-porto-neuchatel',
  'Pizza del Porto',
  'Pizza del Porto',
  'Pizza del Porto',
  'Pizzeria artisanale au port de Neuchatel. Pizzas napolitaines cuites au feu de bois avec des ingredients importes d''Italie. Ambiance decontractee.',
  'Handwerkliche Pizzeria am Hafen von Neuenburg. Neapolitanische Holzofenpizza mit Zutaten aus Italien. Entspannte Atmosphare.',
  'Artisanal pizzeria at Neuchatel harbour. Neapolitan wood-fired pizzas with ingredients imported from Italy. Relaxed atmosphere.',
  'italien', 'neuchatel', 'Neuchatel', 'Rue du Port 7', '2000',
  '+41 32 723 66 77', 'info@pizzadelporto.ch', 'https://pizzadelporto.ch',
  '2', ARRAY['terrace', 'wifi', 'kids-friendly', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "22:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "23:00"}, "saturday": {"open": "12:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 7. Le Comptoir Libanais - Neuchatel
('comptoir-libanais-neuchatel',
  'Le Comptoir Libanais',
  'Die Libanesische Theke',
  'The Lebanese Counter',
  'Mezze, grillades et specialites libanaises preparees avec des produits frais. Houmous, falafel et kebabs dans une ambiance chaleureuse orientale.',
  'Mezze, Grillgerichte und libanesische Spezialitaten mit frischen Produkten zubereitet. Hummus, Falafel und Kebabs in einer warmen orientalischen Atmosphare.',
  'Mezze, grills and Lebanese specialties prepared with fresh products. Hummus, falafel and kebabs in a warm oriental atmosphere.',
  'libanais', 'neuchatel', 'Neuchatel', 'Rue des Moulins 5', '2000',
  '+41 32 726 33 44', 'info@comptoirlibanais.ch', 'https://comptoirlibanais.ch',
  '2', ARRAY['wifi', 'vegetarian', 'vegan', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
  false, true,
  '{"monday": {"open": "11:00", "close": "14:30"}, "tuesday": {"open": "11:00", "close": "14:30"}, "wednesday": {"open": "11:00", "close": "14:30"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 8. Sushizen Neuchatel - Neuchatel
('sushizen-neuchatel',
  'Sushizen',
  'Sushizen',
  'Sushizen',
  'Sushi bar moderne avec poissons frais et preparations japonaises creatives. Menu omakase et bentos du midi dans un cadre zen et epure.',
  'Moderne Sushi-Bar mit frischem Fisch und kreativen japanischen Zubereitungen. Omakase-Menu und Mittagsbentos in einem ruhigen, puristischen Rahmen.',
  'Modern sushi bar with fresh fish and creative Japanese preparations. Omakase menu and lunch bentos in a zen, minimalist setting.',
  'japonais', 'neuchatel', 'Neuchatel', 'Rue du Chateau 3', '2000',
  '+41 32 727 11 88', 'info@sushizen-neuchatel.ch', 'https://sushizen-neuchatel.ch',
  '3', ARRAY['wifi', 'vegetarian', 'takeaway'],
  'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "21:30"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 9. Le Bec Fin - Neuchatel
('le-bec-fin-neuchatel',
  'Le Bec Fin',
  'Der Feinschmecker',
  'The Gourmet Palate',
  'Bistrot francais elegant proposant une cuisine de marche renouvelee chaque semaine. Plat du jour, entrecote et desserts faits maison.',
  'Elegantes franzosisches Bistro mit wochentlich wechselnder Marktkuche. Tagesgericht, Entrecote und hausgemachte Desserts.',
  'Elegant French bistro offering market cuisine renewed weekly. Daily special, entrecote and homemade desserts.',
  'francais', 'neuchatel', 'Neuchatel', 'Place des Halles 4', '2000',
  '+41 32 724 77 88', 'contact@lebecfin-ne.ch', 'https://lebecfin-ne.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'accessible'],
  'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "18:00", "close": "22:30"}, "sunday": {"closed": true}}'
),

-- 10. El Sombrero - Neuchatel
('el-sombrero-neuchatel',
  'El Sombrero',
  'El Sombrero',
  'El Sombrero',
  'Cuisine mexicaine vibrante et coloree. Tacos, burritos et enchiladas prepares avec des epices fraiches. Margaritas et cocktails maison.',
  'Lebhafte und farbenfrohe mexikanische Kuche. Tacos, Burritos und Enchiladas mit frischen Gewurzen zubereitet. Hausgemachte Margaritas und Cocktails.',
  'Vibrant and colorful Mexican cuisine. Tacos, burritos and enchiladas prepared with fresh spices. Homemade margaritas and cocktails.',
  'mexicain', 'neuchatel', 'Neuchatel', 'Rue de la Treille 9', '2000',
  '+41 32 728 55 66', 'hola@elsombrero.ch', 'https://elsombrero.ch',
  '2', ARRAY['terrace', 'wifi', 'vegetarian', 'takeaway', 'live-music'],
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "23:00"}, "saturday": {"open": "12:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "21:00"}}');

-- ============================================
-- FRIBOURG (canton: fribourg, CP: 1700)
-- ============================================

INSERT INTO restaurants (slug, name_fr, name_de, name_en, description_fr, description_de, description_en, cuisine_type, canton, city, address, postal_code, phone, email, website, price_range, features, cover_image, is_featured, is_published, opening_hours) VALUES

-- 1. Le Schild - Fribourg
('le-schild-fribourg',
  'Le Schild',
  'Das Schild',
  'The Schild',
  'Restaurant traditionnel fribourgeois au coeur de la Basse-Ville. Fondue moitie-moitie, taillage et specialites grueriennes dans un cadre medieval.',
  'Traditionelles Freiburger Restaurant im Herzen der Unterstadt. Fondue halb-halb, Taillage und Greyerzer Spezialitaten in mittelalterlichem Rahmen.',
  'Traditional Fribourg restaurant in the heart of the Lower Town. Half-and-half fondue, taillage and Gruyere specialties in a medieval setting.',
  'suisse', 'fribourg', 'Fribourg', 'Rue de Lausanne 48', '1700',
  '+41 26 322 11 22', 'info@leschild.ch', 'https://leschild.ch',
  '2', ARRAY['wifi', 'accessible', 'kids-friendly', 'parking'],
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  true, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "11:00", "close": "22:30"}, "sunday": {"open": "11:00", "close": "21:00"}}'
),

-- 2. Trattoria Fiorentina - Fribourg
('trattoria-fiorentina-fribourg',
  'Trattoria Fiorentina',
  'Trattoria Fiorentina',
  'Trattoria Fiorentina',
  'Veritable trattoria italienne avec pates fraiches et viandes grillees toscanes. Carte des vins italiens soigneusement selectionnee.',
  'Echte italienische Trattoria mit frischer Pasta und toskanischem Grillfliesch. Sorgfaltig ausgewahlte italienische Weinkarte.',
  'Genuine Italian trattoria with fresh pasta and Tuscan grilled meats. Carefully curated Italian wine list.',
  'italien', 'fribourg', 'Fribourg', 'Rue de Romont 12', '1700',
  '+41 26 323 44 55', 'info@fiorentina-fribourg.ch', 'https://fiorentina-fribourg.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 3. Le Chat Botte - Fribourg
('le-chat-botte-fribourg',
  'Le Chat Botte',
  'Der Gestiefelte Kater',
  'Puss in Boots',
  'Cuisine francaise raffinee dans un cadre cosy pres de la cathedrale. Menu du marche et carte saisonniere avec des produits locaux de premiere qualite.',
  'Raffinierte franzosische Kuche in einem gemutlichen Rahmen nahe der Kathedrale. Marktmenu und saisonale Karte mit erstklassigen lokalen Produkten.',
  'Refined French cuisine in a cozy setting near the cathedral. Market menu and seasonal dishes with premium local products.',
  'francais', 'fribourg', 'Fribourg', 'Rue du Pont-Muré 6', '1700',
  '+41 26 321 55 66', 'reservation@lechatbotte.ch', 'https://lechatbotte.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'accessible'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "21:30"}, "friday": {"open": "12:00", "close": "22:00"}, "saturday": {"open": "18:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 4. Tandoori Palace - Fribourg
('tandoori-palace-fribourg',
  'Tandoori Palace',
  'Tandoori Palast',
  'Tandoori Palace',
  'Restaurant indien avec four tandoori traditionnel. Currys parfumes, naans moelleux et biryanis genereux dans une ambiance chaleureuse aux couleurs de l''Inde.',
  'Indisches Restaurant mit traditionellem Tandoori-Ofen. Duftende Currys, weiche Naans und grosszugige Biryanis in einer warmen Atmosphare.',
  'Indian restaurant with traditional tandoori oven. Fragrant curries, soft naans and generous biryanis in a warm atmosphere with Indian colors.',
  'indien', 'fribourg', 'Fribourg', 'Boulevard de Perolles 22', '1700',
  '+41 26 324 88 99', 'info@tandooripalace.ch', 'https://tandooripalace.ch',
  '2', ARRAY['wifi', 'vegetarian', 'vegan', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 5. Le Gothard - Fribourg
('le-gothard-fribourg',
  'Le Gothard',
  'Der Gothard',
  'The Gothard',
  'Brasserie fribourgeoise conviviale proposant la fondue au vacherin, les bricelets et la double creme de la Gruyere. Ambiance authentique et locale.',
  'Gemutliche Freiburger Brasserie mit Vacherin-Fondue, Bricelets und Greyerzer Doppelrahm. Authentische und lokale Atmosphare.',
  'Friendly Fribourg brasserie serving vacherin fondue, bricelets and Gruyere double cream. Authentic local atmosphere.',
  'suisse', 'fribourg', 'Fribourg', 'Place Georges-Python 9', '1700',
  '+41 26 322 66 77', 'contact@legothard.ch', 'https://legothard.ch',
  '2', ARRAY['terrace', 'wifi', 'kids-friendly', 'accessible', 'parking'],
  'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
  false, true,
  '{"monday": {"open": "09:00", "close": "23:00"}, "tuesday": {"open": "09:00", "close": "23:00"}, "wednesday": {"open": "09:00", "close": "23:00"}, "thursday": {"open": "09:00", "close": "23:00"}, "friday": {"open": "09:00", "close": "23:30"}, "saturday": {"open": "09:00", "close": "23:30"}, "sunday": {"open": "10:00", "close": "22:00"}}'
),

-- 6. Pho Saigon - Fribourg
('pho-saigon-fribourg',
  'Pho Saigon',
  'Pho Saigon',
  'Pho Saigon',
  'Saveurs du Vietnam a Fribourg. Pho fumant, bo bun croquant et rouleaux de printemps frais. Une cuisine legere et parfumee aux herbes fraiches.',
  'Vietnamesische Aromen in Freiburg. Dampfende Pho, knuspriger Bo Bun und frische Fruhlingsrollen. Leichte und aromatische Kuche mit frischen Krautern.',
  'Vietnamese flavors in Fribourg. Steaming pho, crispy bo bun and fresh spring rolls. Light and aromatic cuisine with fresh herbs.',
  'vietnamien', 'fribourg', 'Fribourg', 'Rue de la Samaritaine 15', '1700',
  '+41 26 325 11 22', 'info@phosaigon-fr.ch', 'https://phosaigon-fr.ch',
  '2', ARRAY['wifi', 'vegetarian', 'vegan', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
  false, true,
  '{"monday": {"open": "11:00", "close": "14:30"}, "tuesday": {"open": "11:00", "close": "14:30"}, "wednesday": {"open": "11:00", "close": "14:30"}, "thursday": {"open": "11:00", "close": "21:30"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 7. La Table de Fribourg - Fribourg
('la-table-de-fribourg',
  'La Table de Fribourg',
  'Der Freiburger Tisch',
  'The Fribourg Table',
  'Restaurant gastronomique sur les hauteurs de Fribourg. Menu degustation en 5 ou 7 services avec accords mets-vins. Vue panoramique sur les Prealpes.',
  'Gourmetrestaurant in den Hohen von Freiburg. Degustationsmenu mit 5 oder 7 Gangen und Wein-Speise-Begleitung. Panoramablick auf die Voralpen.',
  'Fine dining on the heights of Fribourg. 5 or 7-course tasting menu with wine pairings. Panoramic views of the Pre-Alps.',
  'gastronomique', 'fribourg', 'Fribourg', 'Route de la Gruyere 1', '1700',
  '+41 26 326 77 88', 'reservation@latabledeFribourg.ch', 'https://latabledeFribourg.ch',
  '4', ARRAY['parking', 'wifi', 'private-dining', 'vegetarian', 'accessible'],
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"closed": true}, "wednesday": {"open": "19:00", "close": "22:00"}, "thursday": {"open": "12:00", "close": "14:00"}, "friday": {"open": "12:00", "close": "14:00"}, "saturday": {"open": "19:00", "close": "22:30"}, "sunday": {"open": "11:30", "close": "14:30"}}'
),

-- 8. Greek Corner - Fribourg
('greek-corner-fribourg',
  'Greek Corner',
  'Griechische Ecke',
  'Greek Corner',
  'Taverne grecque authentique. Moussaka, souvlaki, salade grecque et tzatziki prepares selon les recettes traditionnelles. Ambiance mediterraneenne.',
  'Authentische griechische Taverne. Moussaka, Souvlaki, griechischer Salat und Tzatziki nach traditionellen Rezepten. Mediterrane Atmosphare.',
  'Authentic Greek tavern. Moussaka, souvlaki, Greek salad and tzatziki prepared according to traditional recipes. Mediterranean atmosphere.',
  'grec', 'fribourg', 'Fribourg', 'Rue de Morat 18', '1700',
  '+41 26 323 22 33', 'info@greekcorner.ch', 'https://greekcorner.ch',
  '2', ARRAY['terrace', 'wifi', 'vegetarian', 'takeaway', 'kids-friendly'],
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:30"}, "tuesday": {"open": "11:30", "close": "14:30"}, "wednesday": {"open": "11:30", "close": "14:30"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 9. Le Dragon d''Or - Fribourg
('le-dragon-dor-fribourg',
  'Le Dragon d''Or',
  'Der Goldene Drache',
  'The Golden Dragon',
  'Cuisine chinoise et thailandaise dans un decor asiatique elegant. Wok, canard laque et curries parfumes. Buffet du midi en semaine.',
  'Chinesische und thailandische Kuche in einem eleganten asiatischen Dekor. Wok, Peking-Ente und duftende Currys. Mittagsbuffet unter der Woche.',
  'Chinese and Thai cuisine in an elegant Asian setting. Wok, Peking duck and fragrant curries. Weekday lunch buffet.',
  'chinois', 'fribourg', 'Fribourg', 'Avenue de la Gare 31', '1700',
  '+41 26 321 99 00', 'info@dragondor-fr.ch', 'https://dragondor-fr.ch',
  '2', ARRAY['wifi', 'vegetarian', 'takeaway', 'delivery', 'parking'],
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
  false, true,
  '{"monday": {"open": "11:00", "close": "14:30"}, "tuesday": {"open": "11:00", "close": "14:30"}, "wednesday": {"open": "11:00", "close": "14:30"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:30"}}'
),

-- 10. La Cantine du Marche - Fribourg
('la-cantine-du-marche-fribourg',
  'La Cantine du Marche',
  'Die Marktkantine',
  'The Market Canteen',
  'Cuisine mediterraneenne de saison. Mezze, salades composees, grillades et poissons frais. Terrasse animee sur la place du marche en ete.',
  'Saisonale mediterrane Kuche. Mezze, gemischte Salate, Grillgerichte und frischer Fisch. Belebte Terrasse auf dem Marktplatz im Sommer.',
  'Seasonal Mediterranean cuisine. Mezze, mixed salads, grills and fresh fish. Lively terrace on the market square in summer.',
  'mediterraneen', 'fribourg', 'Fribourg', 'Place de l''Hotel-de-Ville 3', '1700',
  '+41 26 322 88 11', 'contact@cantinedumarche.ch', 'https://cantinedumarche.ch',
  '2', ARRAY['terrace', 'wifi', 'vegetarian', 'vegan', 'accessible', 'kids-friendly'],
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
  false, true,
  '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "22:30"}, "saturday": {"open": "09:00", "close": "22:30"}, "sunday": {"closed": true}}');

-- ============================================
-- MONTHEY (canton: valais, CP: 1870)
-- ============================================

INSERT INTO restaurants (slug, name_fr, name_de, name_en, description_fr, description_de, description_en, cuisine_type, canton, city, address, postal_code, phone, email, website, price_range, features, cover_image, is_featured, is_published, opening_hours) VALUES

-- 1. Le Chablais Gourmet - Monthey
('le-chablais-gourmet-monthey',
  'Le Chablais Gourmet',
  'Chablais Gourmet',
  'The Chablais Gourmet',
  'Restaurant gastronomique au coeur du Chablais valaisan. Produits du terroir sublimes, viande sechee des Alpes et fromage a raclette artisanal.',
  'Gourmetrestaurant im Herzen des Walliser Chablais. Veredelte regionale Produkte, Bundnerfleisch aus den Alpen und handgemachter Raclettekase.',
  'Fine dining in the heart of the Chablais region. Elevated local products, Alpine dried meat and artisanal raclette cheese.',
  'gastronomique', 'valais', 'Monthey', 'Rue du Commerce 15', '1870',
  '+41 24 471 22 33', 'reservation@chablaisgourmet.ch', 'https://chablaisgourmet.ch',
  '4', ARRAY['parking', 'wifi', 'private-dining', 'vegetarian', 'accessible'],
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "12:00", "close": "14:00"}, "wednesday": {"open": "12:00", "close": "14:00"}, "thursday": {"open": "12:00", "close": "21:30"}, "friday": {"open": "12:00", "close": "22:00"}, "saturday": {"open": "18:30", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 2. La Trattoria di Maria - Monthey
('trattoria-di-maria-monthey',
  'La Trattoria di Maria',
  'Trattoria di Maria',
  'La Trattoria di Maria',
  'Cuisine italienne familiale et genereuse. Pates fraiches maison, antipasti varies et tiramisu de Maria. Ambiance conviviale a l''italienne.',
  'Familiare und grosszugige italienische Kuche. Hausgemachte frische Pasta, verschiedene Antipasti und Marias Tiramisu. Gemutliche italienische Atmosphare.',
  'Generous family-style Italian cuisine. Homemade fresh pasta, varied antipasti and Maria''s tiramisu. Friendly Italian atmosphere.',
  'italien', 'valais', 'Monthey', 'Avenue de la Gare 8', '1870',
  '+41 24 472 44 55', 'info@trattoriamaria.ch', 'https://trattoriamaria.ch',
  '2', ARRAY['terrace', 'wifi', 'kids-friendly', 'vegetarian', 'takeaway'],
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 3. Le Cafe de la Place - Monthey
('le-cafe-de-la-place-monthey',
  'Le Cafe de la Place',
  'Cafe am Platz',
  'The Square Cafe',
  'Brasserie traditionnelle sur la place centrale de Monthey. Plats du jour, entrecote frites et specialites valaisannes dans une ambiance decontractee.',
  'Traditionelle Brasserie am zentralen Platz von Monthey. Tagesgerichte, Entrecote mit Pommes und Walliser Spezialitaten in entspannter Atmosphare.',
  'Traditional brasserie on the central square of Monthey. Daily specials, steak frites and Valais specialties in a relaxed atmosphere.',
  'francais', 'valais', 'Monthey', 'Place Centrale 3', '1870',
  '+41 24 471 66 77', 'info@cafedelaplace-monthey.ch', 'https://cafedelaplace-monthey.ch',
  '2', ARRAY['terrace', 'wifi', 'kids-friendly', 'accessible'],
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  false, true,
  '{"monday": {"open": "07:00", "close": "23:00"}, "tuesday": {"open": "07:00", "close": "23:00"}, "wednesday": {"open": "07:00", "close": "23:00"}, "thursday": {"open": "07:00", "close": "23:00"}, "friday": {"open": "07:00", "close": "23:30"}, "saturday": {"open": "08:00", "close": "23:30"}, "sunday": {"open": "08:00", "close": "22:00"}}'
),

-- 4. Thai Orchid - Monthey
('thai-orchid-monthey',
  'Thai Orchid',
  'Thai Orchid',
  'Thai Orchid',
  'Cuisine thailandaise authentique preparee par notre chef de Bangkok. Pad Thai, curries rouges et verts, soupes Tom Kha et desserts exotiques.',
  'Authentische thailandische Kuche, zubereitet von unserem Chefkoch aus Bangkok. Pad Thai, rote und grune Currys, Tom-Kha-Suppen und exotische Desserts.',
  'Authentic Thai cuisine prepared by our Bangkok-born chef. Pad Thai, red and green curries, Tom Kha soups and exotic desserts.',
  'thai', 'valais', 'Monthey', 'Rue du Bourg 12', '1870',
  '+41 24 473 88 99', 'info@thaiorchid-monthey.ch', 'https://thaiorchid-monthey.ch',
  '2', ARRAY['wifi', 'vegetarian', 'vegan', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "21:30"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 5. Le Grilladin - Monthey
('le-grilladin-monthey',
  'Le Grilladin',
  'Der Grillmeister',
  'The Grill Master',
  'Burgers gourmet, grillades et ribs a l''americaine. Viandes suisses grillees au charbon de bois, frites maison et milkshakes crémeux.',
  'Gourmet-Burger, Grillgerichte und Ribs auf amerikanische Art. Schweizer Holzkohlefleisch, hausgemachte Pommes und cremige Milchshakes.',
  'Gourmet burgers, grills and American-style ribs. Swiss charcoal-grilled meats, homemade fries and creamy milkshakes.',
  'americain', 'valais', 'Monthey', 'Rue de l''Industrie 5', '1870',
  '+41 24 471 33 44', 'info@legrilladin.ch', 'https://legrilladin.ch',
  '2', ARRAY['terrace', 'wifi', 'kids-friendly', 'takeaway', 'parking'],
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}'
),

-- 6. La Piazza - Monthey
('la-piazza-monthey',
  'La Piazza',
  'La Piazza',
  'La Piazza',
  'Pizzeria et ristorante au coeur de Monthey. Pizzas au feu de bois, risottos crémeux et desserts italiens maison. Terrasse animee en ete.',
  'Pizzeria und Ristorante im Herzen von Monthey. Holzofenpizza, cremige Risottos und hausgemachte italienische Desserts. Belebte Sommerterrasse.',
  'Pizzeria and ristorante in the heart of Monthey. Wood-fired pizzas, creamy risottos and homemade Italian desserts. Lively summer terrace.',
  'italien', 'valais', 'Monthey', 'Rue du Chateau 7', '1870',
  '+41 24 472 11 22', 'info@lapiazza-monthey.ch', 'https://lapiazza-monthey.ch',
  '2', ARRAY['terrace', 'wifi', 'kids-friendly', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
  false, true,
  '{"monday": {"open": "11:00", "close": "14:00"}, "tuesday": {"open": "11:00", "close": "14:00"}, "wednesday": {"open": "11:00", "close": "14:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "22:30"}, "saturday": {"open": "11:00", "close": "22:30"}, "sunday": {"open": "11:00", "close": "21:00"}}'
),

-- 7. Le Relais du Simplon - Monthey
('le-relais-du-simplon-monthey',
  'Le Relais du Simplon',
  'Simplon Rasthaus',
  'The Simplon Inn',
  'Restaurant suisse traditionnel avec fondue, raclette et assiette valaisanne. Cadre rustique et chaleureux avec cheminee en hiver.',
  'Traditionelles Schweizer Restaurant mit Fondue, Raclette und Walliser Teller. Rustikales und warmes Ambiente mit Kamin im Winter.',
  'Traditional Swiss restaurant with fondue, raclette and Valais platter. Rustic and warm setting with fireplace in winter.',
  'suisse', 'valais', 'Monthey', 'Route du Simplon 2', '1870',
  '+41 24 473 55 66', 'info@relaisdusimplon.ch', 'https://relaisdusimplon.ch',
  '2', ARRAY['parking', 'wifi', 'kids-friendly', 'accessible', 'live-music'],
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
  false, true,
  '{"monday": {"open": "11:30", "close": "14:00"}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "11:00", "close": "22:30"}, "sunday": {"open": "11:00", "close": "21:30"}}'
),

-- 8. Wok & Saveurs - Monthey
('wok-et-saveurs-monthey',
  'Wok & Saveurs',
  'Wok & Geschmack',
  'Wok & Flavors',
  'Cuisine asiatique au wok avec specialites chinoises et thailandaises. Buffet du midi genereux et plats a emporter. Frais et savoureux.',
  'Asiatische Wok-Kuche mit chinesischen und thailandischen Spezialitaten. Grosszugiges Mittagsbuffet und Gerichte zum Mitnehmen. Frisch und schmackhaft.',
  'Asian wok cuisine with Chinese and Thai specialties. Generous lunch buffet and takeaway dishes. Fresh and flavorful.',
  'chinois', 'valais', 'Monthey', 'Rue du Coppet 18', '1870',
  '+41 24 471 77 88', 'info@woketsaveurs.ch', 'https://woketsaveurs.ch',
  '1', ARRAY['wifi', 'vegetarian', 'takeaway', 'delivery'],
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
  false, true,
  '{"monday": {"open": "11:00", "close": "14:30"}, "tuesday": {"open": "11:00", "close": "14:30"}, "wednesday": {"open": "11:00", "close": "14:30"}, "thursday": {"open": "11:00", "close": "21:30"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "11:30", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 9. Le Bistrot des Alpes - Monthey
('le-bistrot-des-alpes-monthey',
  'Le Bistrot des Alpes',
  'Alpen Bistro',
  'The Alpine Bistro',
  'Bistrot moderne avec cuisine francaise revisitee et influences alpines. Plats de saison, vins du Valais et desserts faits maison.',
  'Modernes Bistro mit neuinterpretierter franzosischer Kuche und alpinen Einflussen. Saisonale Gerichte, Walliser Weine und hausgemachte Desserts.',
  'Modern bistro with revisited French cuisine and Alpine influences. Seasonal dishes, Valais wines and homemade desserts.',
  'francais', 'valais', 'Monthey', 'Rue du Pont 11', '1870',
  '+41 24 472 99 00', 'contact@bistrotdesalpes.ch', 'https://bistrotdesalpes.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'accessible'],
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  false, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "21:30"}, "friday": {"open": "11:30", "close": "22:00"}, "saturday": {"open": "18:00", "close": "22:00"}, "sunday": {"closed": true}}'
),

-- 10. Sapori del Sud - Monthey
('sapori-del-sud-monthey',
  'Sapori del Sud',
  'Sapori del Sud',
  'Sapori del Sud',
  'Trattoria italienne specialisee dans les saveurs du sud de l''Italie. Fruits de mer, pates aux palourdes, melanzane alla parmigiana et limoncello maison.',
  'Italienische Trattoria spezialisiert auf Aromen Suditaliens. Meeresfruchte, Pasta mit Muscheln, Melanzane alla Parmigiana und hausgemachter Limoncello.',
  'Italian trattoria specializing in southern Italian flavors. Seafood, clam pasta, melanzane alla parmigiana and homemade limoncello.',
  'italien', 'valais', 'Monthey', 'Rue des Bourguignons 6', '1870',
  '+41 24 473 22 33', 'info@saporidelsud.ch', 'https://saporidelsud.ch',
  '3', ARRAY['terrace', 'wifi', 'vegetarian', 'private-dining'],
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  true, true,
  '{"monday": {"closed": true}, "tuesday": {"open": "11:30", "close": "14:00"}, "wednesday": {"open": "11:30", "close": "14:00"}, "thursday": {"open": "11:30", "close": "22:00"}, "friday": {"open": "11:30", "close": "22:30"}, "saturday": {"open": "12:00", "close": "22:30"}, "sunday": {"open": "12:00", "close": "21:00"}}');

-- ============================================
-- REVIEWS pour les nouveaux restaurants
-- ============================================

-- Neuchatel reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-cafe-du-cerf-neuchatel'), 'Philippe R.', 4, 'Un classique neuchatelois. La fondue est excellente et le service toujours agreable. On y retourne avec plaisir.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-cafe-du-cerf-neuchatel'), 'Sandra M.', 5, 'Ambiance chaleureuse et plats genereux. Le rosti maison est un delice. Parfait pour un repas en famille.'),
  ((SELECT id FROM restaurants WHERE slug = 'da-vinci-neuchatel'), 'Luisa T.', 5, 'Les meilleures pates de Neuchatel! La vue sur le lac depuis la terrasse est magnifique. A ne pas manquer.'),
  ((SELECT id FROM restaurants WHERE slug = 'da-vinci-neuchatel'), 'Marco B.', 4, 'Autentica cucina italiana! La carbonara est parfaite, comme a Rome. Bravo au chef.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-poisson-rouge-neuchatel'), 'Anne-Claire D.', 5, 'Les filets de perche sont d''une fraicheur incroyable. Le meilleur restaurant de poisson de la region.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-poisson-rouge-neuchatel'), 'Patrick L.', 4, 'Excellente bondelle du lac. Cadre elegant et service attentionne. Prix justifies par la qualite.'),
  ((SELECT id FROM restaurants WHERE slug = 'chez-ming-neuchatel'), 'Julie W.', 4, 'Dim sum delicieux et canard laque parfait. Un vrai voyage en Chine au coeur de Neuchatel.'),
  ((SELECT id FROM restaurants WHERE slug = 'escale-gourmande-neuchatel'), 'Bernard G.', 5, 'Experience gastronomique exceptionnelle. Le menu degustation est un enchantement. Service impeccable.'),
  ((SELECT id FROM restaurants WHERE slug = 'escale-gourmande-neuchatel'), 'Claudine F.', 5, 'Un bijou culinaire. Chaque plat est une oeuvre d''art. La carte des vins est remarquable.'),
  ((SELECT id FROM restaurants WHERE slug = 'pizza-del-porto-neuchatel'), 'Nicolas P.', 4, 'Meilleures pizzas de Neuchatel, pate fine et croustillante. Parfait pour un repas rapide et savoureux.'),
  ((SELECT id FROM restaurants WHERE slug = 'comptoir-libanais-neuchatel'), 'Fatima A.', 5, 'Enfin un vrai libanais a Neuchatel! Le houmous et les falafels sont authentiques et delicieux.'),
  ((SELECT id FROM restaurants WHERE slug = 'sushizen-neuchatel'), 'Kenji Y.', 4, 'Tres bon sushi pour la Suisse. Le poisson est frais et la presentation soignee. Menu omakase recommande.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-bec-fin-neuchatel'), 'Isabelle C.', 5, 'Bistrot francais comme on les aime. Le plat du jour est toujours une bonne surprise. Terrasse agreable.'),
  ((SELECT id FROM restaurants WHERE slug = 'el-sombrero-neuchatel'), 'Carlos R.', 4, 'Bonne cuisine mexicaine et cocktails excellents. Ambiance festive le vendredi soir. Les tacos al pastor sont top.');

-- Fribourg reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-schild-fribourg'), 'Marie-Therese B.', 5, 'La meilleure fondue de Fribourg! Le melange vacherin-gruyere est parfait. Cadre medieval charmant.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-schild-fribourg'), 'Hans-Peter K.', 5, 'Authentische Freiburger Kuche vom Feinsten. Das Fondue moitie-moitie ist ein Muss!'),
  ((SELECT id FROM restaurants WHERE slug = 'trattoria-fiorentina-fribourg'), 'Gianluca M.', 4, 'Come in Italia! Les pates sont fraiches et la sauce bolognaise est genereuse. Tres bon rapport qualite-prix.'),
  ((SELECT id FROM restaurants WHERE slug = 'trattoria-fiorentina-fribourg'), 'Stephanie V.', 5, 'Notre italien prefere a Fribourg. Le risotto aux cèpes est divin. Reservation recommandee le week-end.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-chat-botte-fribourg'), 'Francoise D.', 5, 'Cuisine francaise delicate et produits de premiere qualite. Le menu du marche est toujours une excellente surprise.'),
  ((SELECT id FROM restaurants WHERE slug = 'tandoori-palace-fribourg'), 'Raj P.', 4, 'Authentic Indian flavors. The butter chicken and garlic naan are excellent. Good value for money.'),
  ((SELECT id FROM restaurants WHERE slug = 'tandoori-palace-fribourg'), 'Christine L.', 5, 'Le meilleur indien de Fribourg. Les naans sont moelleux et les curries tres parfumes. A decouvrir!'),
  ((SELECT id FROM restaurants WHERE slug = 'le-gothard-fribourg'), 'Pascal M.', 4, 'Bonne brasserie avec fondue au vacherin onctueuse. La double creme en dessert est incontournable.'),
  ((SELECT id FROM restaurants WHERE slug = 'pho-saigon-fribourg'), 'Linh N.', 5, 'Le pho est authentique et le bo bun parfait. Enfin de la vraie cuisine vietnamienne a Fribourg!'),
  ((SELECT id FROM restaurants WHERE slug = 'la-table-de-fribourg'), 'Jacques R.', 5, 'Experience gastronomique memorable. Le menu degustation 7 services avec accords vins est exceptionnel.'),
  ((SELECT id FROM restaurants WHERE slug = 'la-table-de-fribourg'), 'Elisabeth W.', 5, 'Eines der besten Restaurants in Freiburg. Exquisite Kuche und atemberaubende Aussicht auf die Voralpen.'),
  ((SELECT id FROM restaurants WHERE slug = 'greek-corner-fribourg'), 'Nikos S.', 4, 'Bonne taverne grecque. La moussaka est bien preparee et le tzatziki est frais. Ambiance sympathique.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-dragon-dor-fribourg'), 'Mei L.', 4, 'Bon buffet du midi a prix raisonnable. Le canard laque est bien prepare. Service rapide et efficace.'),
  ((SELECT id FROM restaurants WHERE slug = 'la-cantine-du-marche-fribourg'), 'Sophie B.', 5, 'Super concept de cuisine mediterraneenne fraiche. La terrasse en ete est un vrai bonheur. Salades delicieuses.');

-- Monthey reviews
INSERT INTO reviews (restaurant_id, author_name, rating, comment) VALUES
  ((SELECT id FROM restaurants WHERE slug = 'le-chablais-gourmet-monthey'), 'Jean-Marc V.', 5, 'La perle gastronomique du Chablais. Produits locaux magnifiquement travailles. Une adresse incontournable.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-chablais-gourmet-monthey'), 'Florence A.', 5, 'Menu degustation exceptionnel. Le chef sublime les produits du terroir valaisan. Service elegant et discret.'),
  ((SELECT id FROM restaurants WHERE slug = 'trattoria-di-maria-monthey'), 'Giuseppe F.', 4, 'Comme chez mamma! Les pates sont fraiches et genereuses. Le tiramisu de Maria est le meilleur du Valais.'),
  ((SELECT id FROM restaurants WHERE slug = 'trattoria-di-maria-monthey'), 'Valerie P.', 5, 'Notre cantine italienne preferee. Accueil chaleureux et cuisine authentique. Les enfants adorent!'),
  ((SELECT id FROM restaurants WHERE slug = 'le-cafe-de-la-place-monthey'), 'Robert D.', 4, 'Bonne brasserie de quartier. Le plat du jour est toujours copieux et bien prepare. Terrasse agreable en ete.'),
  ((SELECT id FROM restaurants WHERE slug = 'thai-orchid-monthey'), 'Somchai T.', 5, 'Authentique cuisine thai! Le curry vert est parfume a souhait et le pad thai croustillant comme il faut.'),
  ((SELECT id FROM restaurants WHERE slug = 'thai-orchid-monthey'), 'Caroline M.', 4, 'Tres bon thai a Monthey. Les portions sont genereuses et les prix corrects. Livraison rapide.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-grilladin-monthey'), 'David S.', 4, 'Meilleurs burgers de la region! La viande est de qualite et les frites maison sont excellentes.'),
  ((SELECT id FROM restaurants WHERE slug = 'la-piazza-monthey'), 'Antonio C.', 4, 'Bonne pizza au feu de bois. La margherita est simple mais parfaite. Terrasse sympa en ete.'),
  ((SELECT id FROM restaurants WHERE slug = 'la-piazza-monthey'), 'Nathalie R.', 5, 'Les enfants adorent les pizzas et nous les risottos. Parfait pour un repas en famille le dimanche.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-relais-du-simplon-monthey'), 'Pierre-Andre G.', 5, 'La raclette valaisanne comme on l''aime! Cadre rustique et chaleureux. Parfait en hiver au coin du feu.'),
  ((SELECT id FROM restaurants WHERE slug = 'wok-et-saveurs-monthey'), 'Thomas H.', 4, 'Bon rapport qualite-prix pour le buffet du midi. Plats frais et varies. Ideal pour une pause dejeuner.'),
  ((SELECT id FROM restaurants WHERE slug = 'le-bistrot-des-alpes-monthey'), 'Aurelie J.', 5, 'Cuisine raffinee avec une touche alpine. Les vins du Valais sont bien selectionnes. Cadre moderne et agreable.'),
  ((SELECT id FROM restaurants WHERE slug = 'sapori-del-sud-monthey'), 'Salvatore L.', 5, 'Les saveurs du sud de l''Italie a Monthey! Les spaghetti alle vongole sont divins. Limoncello maison parfait.');
