-- Colonnes Google Places sur `restaurants` (google_place_id / google_rating /
-- google_review_count), requises par le correctif #34 (source de vérité
-- unique pour la note affichée : la note Google prévaut sur avg_rating/
-- review_count quand elle est disponible — voir queries.ts LIST_SELECT,
-- RestaurantCard.tsx, RestaurantDetailClient.tsx et [slug]/page.tsx).
--
-- CONTEXTE (revue de sécurité — bloquant B) : ces colonnes sont créées par
-- la migration 0025_google_rating.sql, présente sur une autre branche
-- (feat/etablissement-rename-ratings-blog-i18n, commit 71f67db) non encore
-- mergée sur `main`. Sans garantie que 0025 ait été appliquée à la base
-- cible de ce lot, `LIST_SELECT` nommant explicitement
-- "google_rating,google_review_count" échouerait (colonnes inconnues) et
-- ferait retomber TOUTES les listes de restaurants sur { data: [], totalCount: 0 }
-- via le catch de fetchFilteredRestaurants.
--
-- Cette migration reprend EXACTEMENT la définition de 0025 (mêmes types) et
-- est idempotente (IF NOT EXISTS) : si les colonnes existent déjà (0025
-- appliquée), aucun effet ; si elles manquent, elles sont créées vides — le
-- repli `google_rating ?? avg_rating` déjà en place dans le code gère les
-- valeurs NULL.
--
-- ⚠️ IMPORTANT : comme 0031, cette migration N'A PAS été appliquée à la base
-- (contrainte de la tâche — aucune migration ne doit être appliquée). Elle
-- DOIT être exécutée via `supabase db push` AVANT le déploiement de ce lot,
-- sous peine de faire échouer toutes les requêtes restaurants (select sur
-- colonnes inexistantes).

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS google_review_count INT;

CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id ON restaurants(google_place_id);
