-- Incrément atomique des compteurs de vues/clics des Happy Hours.
--
-- Contexte (recette #39a) : trackHappyHourClick()/trackHappyHourView()
-- faisaient un lire-puis-écrire en deux requêtes distinctes (SELECT puis
-- UPDATE côté application). Deux appels concurrents lisant la même valeur N
-- écrivent tous les deux N+1 au lieu de N+2, faisant perdre des incréments
-- sous forte concurrence (page vue simultanément par plusieurs visiteurs).
--
-- Cette fonction reprend le pattern déjà utilisé pour
-- increment_broadcast_stat() (voir 0026_whatsapp_read_tracking.sql) : un
-- seul UPDATE ... SET x = x + 1 exécuté atomiquement côté Postgres.
--
-- NOTE : cette migration n'a PAS été appliquée à la base (contrainte de la
-- tâche). Elle doit être exécutée via `supabase db push` avant que le code
-- appelant `supabase.rpc("increment_happy_hour_stat", ...)` puisse fonctionner.

CREATE OR REPLACE FUNCTION increment_happy_hour_stat(
  p_happy_hour_id UUID,
  p_field TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_field = 'views_count' THEN
    UPDATE happy_hours SET views_count = views_count + 1 WHERE id = p_happy_hour_id;
  ELSIF p_field = 'clicks_count' THEN
    UPDATE happy_hours SET clicks_count = clicks_count + 1 WHERE id = p_happy_hour_id;
  END IF;
END;
$$;
