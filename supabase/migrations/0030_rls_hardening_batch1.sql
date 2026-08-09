-- ============================================================================
-- Lot 1 : durcissement RLS (whatsapp_subscribers, whatsapp_message_tracking,
-- reviews).
--
-- Contexte : ces tables sont accédées côté application EXCLUSIVEMENT via
-- createAdminClient() (clé service_role), qui contourne RLS. Activer RLS et
-- ne créer AUCUNE policy pour les rôles anon/authenticated est donc sans
-- impact sur les flux serveur légitimes existants (webhooks WhatsApp,
-- Server Actions merchant/admin, cron, etc.) : ces flux continueront de
-- fonctionner normalement.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- whatsapp_subscribers
-- ----------------------------------------------------------------------------
-- Cette table a été créée manuellement (aucune migration antérieure ne la
-- définit) — son schéma exact (types de colonnes, contraintes, valeurs par
-- défaut, index) N'A PAS été vérifié ici et DOIT être confirmé dans le
-- dashboard Supabase avant toute modification structurelle future.
-- D'après le code applicatif (src/app/api/whatsapp-subscribe/route.ts,
-- src/app/api/webhooks/whatsapp/route.ts, src/actions/merchant/whatsapp-broadcast.ts,
-- src/lib/whatsapp/broadcast.ts), elle contient au moins les colonnes :
--   id, restaurant_id, phone, first_name, source, is_active, subscribed_at
-- et un contrat d'unicité (restaurant_id, phone) (utilisé par un upsert
-- avec onConflict: "restaurant_id,phone").
--
-- On se contente ici d'activer RLS sans policy anon/authenticated : la table
-- devient invisible/inaccessible via la clé anon (PostgREST), ce qui bloque
-- l'exploitation directe (lecture ou écriture) que permettait l'absence de
-- RLS. Aucune policy service_role explicite n'est nécessaire : service_role
-- contourne RLS par construction dans Supabase.
ALTER TABLE IF EXISTS whatsapp_subscribers ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- whatsapp_message_tracking
-- ----------------------------------------------------------------------------
-- Définie dans 0026_whatsapp_read_tracking.sql, jamais RLS n'a été activé.
-- Accédée uniquement via createAdminClient() (webhook Meta + broadcast).
ALTER TABLE IF EXISTS whatsapp_message_tracking ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- reviews : retrait de la policy INSERT publique (WITH CHECK true)
-- ----------------------------------------------------------------------------
-- Analyse du code (src/actions/reviews.ts, src/actions/merchant/reviews.ts,
-- src/actions/admin/reviews.ts) : TOUTE écriture sur `reviews` passe par des
-- Server Actions "use server" utilisant createAdminClient() (service_role),
-- avec validation côté serveur (longueur du nom, note entre 1 et 5,
-- vérification que le restaurant existe et est publié). Aucun insert direct
-- depuis un client Supabase anon n'a été trouvé dans le code.
--
-- La policy "Public can submit reviews" (WITH CHECK (true)), créée dans
-- 0001_initial_schema.sql, autorise donc n'importe qui possédant la clé anon
-- à insérer des avis arbitraires (nom, note, commentaire, restaurant_id
-- quelconque) directement via PostgREST, en contournant toute la validation
-- applicative de submitReview(). Comme le flux légitime (formulaire d'avis du
-- site) n'utilise pas cette policy — il passe par service_role — on peut la
-- supprimer sans casser la soumission d'avis réelle.
DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;

-- La policy de lecture publique ("Public can view reviews", restreinte aux
-- restaurants publiés) N'EST PAS touchée : elle est légitime et nécessaire
-- pour l'affichage public des avis.
