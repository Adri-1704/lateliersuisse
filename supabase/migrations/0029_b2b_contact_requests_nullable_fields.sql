-- Migration : b2b_contact_requests — first_name/last_name/city nullable
--
-- Le formulaire réel (B2BContactForm.tsx) et les emails de notification
-- (b2bAdminNotification/b2bConfirmation dans lib/email-templates.ts) n'ont
-- jamais collecté que restaurant_name/email/phone/message/locale — jamais
-- first_name, last_name ni city. Pourtant la table (migration 0003)
-- les définit NOT NULL, ce qui fait échouer l'INSERT à chaque soumission
-- (erreur loguée mais avalée dans submitB2BContactRequest, qui renvoie
-- quand même success:true — la demande n'est donc jamais enregistrée en
-- base, seuls les emails de notification partent).
--
-- L'admin (/admin/b2b-requests) gère déjà proprement leur absence
-- (`r.first_name || r.last_name ? ... : "—"`, `r.city || "—"`) — preuve que
-- ces champs étaient censés être facultatifs depuis le début.

alter table public.b2b_contact_requests
  alter column first_name drop not null,
  alter column last_name drop not null,
  alter column city drop not null;
