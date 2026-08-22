"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { claimRequestAdminNotification, claimApprovedNotification, newSignupAdminNotification } from "@/lib/email-templates";
import { logConversionEvent } from "@/lib/analytics/conversion-events";
import { isPlausiblePhoneNumber } from "@/lib/phone";

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  restaurantSlug: string | null;
}

interface RegisterResult {
  success: boolean;
  error: string | null;
  /**
   * Code machine-lisible pour le cas "un compte existe déjà" : permet à
   * l'UI de proposer des liens (connexion / mot de passe oublié) sans
   * dépendre du texte exact du message d'erreur.
   */
  errorCode?: "account_exists";
  claim_request_id?: string;
  claim_status?: "pending";
}

// Message renvoyé aussi bien quand un `merchants` existe déjà pour cet email
// que quand le compte Supabase Auth existant est un "vrai" compte (rattaché
// à un merchant) : dans les deux cas c'est un cul-de-sac pour l'utilisateur
// s'il n'est pas orienté vers la connexion ou la réinitialisation de mot de
// passe (voir /espace-client/connexion et /espace-client/mot-de-passe-oublie).
const ACCOUNT_EXISTS_RESULT: RegisterResult = {
  success: false,
  error:
    "Un compte existe déjà avec cet email. Connectez-vous à votre espace client, ou réinitialisez votre mot de passe si vous l'avez oublié.",
  errorCode: "account_exists",
};

/**
 * Recherche un utilisateur Supabase Auth par email.
 *
 * L'API admin GoTrue exposée par `supabase-js` (`auth.admin.listUsers`) ne
 * permet de filtrer que par page/perPage, pas par email — on doit donc
 * parcourir les pages nous-mêmes. N'est appelé que quand
 * `auth.admin.createUser` vient d'échouer avec "already been registered",
 * pour retrouver l'utilisateur concerné et évaluer s'il s'agit d'un compte
 * orphelin récupérable (voir `isOrphanAuthUser`). Même approche que celle
 * déjà utilisée dans `src/lib/subscriptions/webhook-handler.ts`.
 */
async function findAuthUserByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
): Promise<{ id: string } | null> {
  const target = email.toLowerCase().trim();
  const perPage = 200;
  // Garde-fou : au-delà de 50 pages (10 000 utilisateurs), on abandonne
  // plutôt que de boucler indéfiniment — hors de portée à l'échelle actuelle
  // de la plateforme.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users) break;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return { id: found.id };
    if (data.users.length < perPage) break; // dernière page atteinte
  }
  return null;
}

/**
 * Détermine si un utilisateur Supabase Auth est un "orphelin" récupérable :
 * un compte Auth créé lors d'une inscription précédente restée incomplète
 * (échec entre l'étape `auth.admin.createUser` et l'insertion du
 * `merchants` correspondant, avant que la compensation ci-dessous
 * n'existe), auquel plus aucune ressource métier n'est rattachée.
 *
 * ⚠️ RAISONNEMENT DE SÉCURITÉ (à relire attentivement) : cette fonction
 * conditionne la possibilité, pour quiconque fournit seulement un email et
 * un mot de passe — l'email n'est JAMAIS vérifié ici, `email_confirm: true`
 * est forcé sans envoi de lien de confirmation — de "reprendre la main" sur
 * un compte Auth existant en réinitialisant son mot de passe. Une erreur
 * dans cette fonction serait une prise de contrôle de compte triviale. On
 * est donc délibérément conservateur.
 *
 * Un compte Auth est considéré orphelin SI ET SEULEMENT SI :
 *   1. aucune ligne `merchants` n'a cet email (vérifié par l'appelant AVANT
 *      même de tenter `createUser`, cf. étape 1 de `registerMerchant`) ; ET
 *   2. aucune ligne `merchants` n'a `auth_user_id` égal à cet utilisateur
 *      Auth (vérifié ici).
 *
 * Ces deux conditions suffisent à garantir qu'aucune ressource métier n'est
 * rattachée à ce compte, car dans le schéma (`supabase/migrations/0001_*.sql`
 * et `0008_claim_requests_and_flow.sql`) `merchants` est le seul point
 * d'entrée vers tout le reste :
 *   - `restaurants.merchant_id` est une clé étrangère vers `merchants.id`
 *     (`ON DELETE SET NULL`) ;
 *   - `claim_requests.merchant_id` est une clé étrangère `NOT NULL` vers
 *     `merchants.id` (`ON DELETE CASCADE`) ;
 *   - `subscriptions.merchant_id` est une clé étrangère `NOT NULL` vers
 *     `merchants.id` (`ON DELETE CASCADE`).
 * Ces contraintes FK sont appliquées par Postgres : aucune ligne de ces
 * tables ne peut exister sans référencer un `merchants.id` existant. Si
 * aucun `merchants` ne pointe vers cet utilisateur Auth (ni par email, ni
 * par `auth_user_id`), aucun restaurant, aucune demande de revendication et
 * aucun abonnement ne peut lui être rattaché non plus — il n'y a donc
 * structurellement rien d'autre à vérifier ni à protéger.
 *
 * En cas d'erreur de lecture (impossible de garantir l'absence de
 * rattachement), on refuse par prudence : le compte n'est PAS considéré
 * comme orphelin, quitte à renvoyer une erreur générique à l'utilisateur
 * plutôt que de risquer une prise de contrôle de compte.
 */
async function isOrphanAuthUser(
  supabase: ReturnType<typeof createAdminClient>,
  authUserId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("merchants")
    .select("id")
    .eq("auth_user_id", authUserId)
    .limit(1) as { data: { id: string }[] | null; error: unknown };

  if (error) {
    console.error("isOrphanAuthUser: échec de la vérification, on refuse par prudence:", error);
    return false;
  }

  return !data || data.length === 0;
}

export async function registerMerchant(params: RegisterParams): Promise<RegisterResult> {
  const { name, email, password, phone, restaurantSlug } = params;

  // Validation
  if (!name || name.length < 2) return { success: false, error: "Nom requis (2 caractères minimum)" };
  if (!email || !email.includes("@")) return { success: false, error: "Email invalide" };
  if (!password || password.length < 6) return { success: false, error: "Mot de passe requis (6 caractères minimum)" };
  // Le numéro WhatsApp est optionnel, mais s'il est renseigné il doit être
  // plausible (#36) : la validation client peut être contournée.
  if (phone && !isPlausiblePhoneNumber(phone)) {
    return { success: false, error: "Numéro de téléphone invalide" };
  }

  const supabase = createAdminClient();

  // 1. Check if merchant email already exists
  const { data: existingMerchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("email", email)
    .single() as { data: { id: string } | null; error: unknown };

  if (existingMerchant) {
    return { ...ACCOUNT_EXISTS_RESULT };
  }

  // 2. Create Supabase Auth user
  //
  // `authUserId` peut provenir soit d'une création réussie dans CET appel,
  // soit de la récupération d'un compte orphelin préexistant (voir
  // `isOrphanAuthUser`). `createdNewAuthUser` distingue les deux cas : on ne
  // supprime JAMAIS (compensation ci-dessous) un utilisateur qui existait
  // déjà avant cet appel, même récupéré comme orphelin — seule l'annulation
  // d'une création que l'on vient tout juste de faire est sûre.
  let authUserId: string | undefined;
  let createdNewAuthUser = false;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (!authError.message?.includes("already been registered")) {
      return { success: false, error: "Erreur lors de la création du compte" };
    }

    // Un compte Auth existe déjà pour cet email — mais on vient de vérifier
    // ci-dessus qu'aucun `merchants.email` n'y correspond. Reste à
    // déterminer si ce compte Auth est un orphelin récupérable (créé lors
    // d'une inscription précédente restée incomplète) ou un vrai compte
    // existant (l'email Auth peut en théorie différer de `merchants.email`
    // si l'email a été changé côté Auth sans mise à jour de `merchants` —
    // cas limite couvert par la vérification par `auth_user_id`).
    const existingAuthUser = await findAuthUserByEmail(supabase, email);

    if (!existingAuthUser) {
      // Ne devrait normalement jamais arriver (Supabase vient de dire que
      // l'email est pris) — message générique par prudence.
      console.error(`registerMerchant: "already been registered" pour un email, mais utilisateur introuvable via listUsers.`);
      return { success: false, error: "Erreur lors de la création du compte. Veuillez réessayer." };
    }

    const orphan = await isOrphanAuthUser(supabase, existingAuthUser.id);

    if (!orphan) {
      // Vrai compte existant, rattaché à un commerçant : cas légitime.
      return { ...ACCOUNT_EXISTS_RESULT };
    }

    // Compte orphelin confirmé (cf. `isOrphanAuthUser`) : on réutilise ce
    // compte Auth pour cette inscription, en lui appliquant le mot de passe
    // fourni ici. Sûr car aucune ressource métier n'y est attachée — il n'y
    // a donc rien qu'un mot de passe différent pourrait "voler".
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingAuthUser.id, {
      password,
      email_confirm: true,
    });

    if (updateError) {
      console.error("registerMerchant: échec de la réinitialisation du compte orphelin:", updateError);
      return { success: false, error: "Erreur lors de la création du compte. Veuillez réessayer." };
    }

    authUserId = existingAuthUser.id;
    createdNewAuthUser = false;
  } else {
    authUserId = authData.user?.id;
    createdNewAuthUser = true;
  }

  if (!authUserId) {
    return { success: false, error: "Erreur lors de la création du compte" };
  }

  // 3. Create merchant record
  const { data: merchant, error: merchantError } = await (supabase
    .from("merchants") as ReturnType<typeof supabase.from>)
    .insert({
      email,
      name,
      phone: phone || null,
      auth_user_id: authUserId,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (merchantError || !merchant) {
    // Compensation : si CET appel vient de créer l'utilisateur Auth, on le
    // supprime pour ne pas laisser d'orphelin qui bloquerait
    // définitivement cet email (l'email deviendrait rejeté par `createUser`
    // au prochain essai sans qu'aucun compte exploitable n'existe). On ne
    // supprime JAMAIS un compte récupéré/préexistant — cf. raisonnement de
    // sécurité de `isOrphanAuthUser` ci-dessus.
    if (createdNewAuthUser) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
      if (deleteError) {
        console.error(
          "registerMerchant: échec du rollback de l'utilisateur Auth après échec de création du merchant:",
          deleteError,
          "authUserId:",
          authUserId
        );
      }
    }
    return { success: false, error: "Erreur lors de la création du profil" };
  }

  const merchantId = (merchant as Record<string, unknown>).id as string;

  // Log signup_completed event (non-blocking)
  void logConversionEvent({
    eventType: "signup_completed",
    merchantId,
    metadata: { has_restaurant_claim: !!restaurantSlug },
  });

  // 4. If restaurant selected, create a claim request (manual validation by admin)
  //
  // Délègue à `createClaimRequestCore` (le même cœur durci que
  // `claimExistingRestaurant`) pour bénéficier du verrou atomique anti-course,
  // du nettoyage des demandes rejetées et du relâchement du verrou en cas
  // d'échec — au lieu de dupliquer cette logique ici sans ces garanties.
  // `forceManualReview: true` conserve le comportement historique de ce
  // parcours (toujours `pending`/`manual`, jamais d'auto-approbation par
  // correspondance d'email).
  if (restaurantSlug) {
    const claimResult = await createClaimRequestCore({
      merchantId,
      merchantName: name,
      merchantEmail: email,
      merchantPhone: phone || "",
      restaurantSlug,
      forceManualReview: true,
    });

    if (!claimResult.success) {
      // Le compte marchand a bel et bien été créé (étape 3 ci-dessus) : on
      // ne le supprime pas. En revanche, on ne renvoie JAMAIS
      // `success: true` / `claim_status: 'pending'` si aucun claim n'existe
      // réellement (cf. F1) — on propage l'échec du claim de façon honnête,
      // cohérente avec la gestion d'erreurs du reste de la fonction.
      console.error("Claim request creation failed during registerMerchant:", claimResult.error);
      return {
        success: false,
        error: claimResult.error || "Le compte a été créé, mais la revendication de la fiche a échoué. Vous pouvez la revendiquer depuis votre espace client.",
      };
    }

    return {
      success: true,
      error: null,
      claim_request_id: claimResult.claimId,
      claim_status: "pending",
    };
  }

  // No restaurant selected — merchant created without claim
  // Notifier l'admin de la nouvelle inscription
  try {
    const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
    const template = newSignupAdminNotification({
      merchantName: name,
      merchantEmail: email,
      merchantPhone: phone || "Non renseigné",
    });
    await sendEmail({
      to: adminEmailAddress,
      subject: template.subject,
      html: template.html,
      replyTo: email,
    });
  } catch (emailErr) {
    console.error("Failed to send signup admin notification:", emailErr);
  }

  return { success: true, error: null };
}

/**
 * Search restaurants available for claiming (no merchant_id set and not already pending)
 */
export async function searchAvailableRestaurants(query: string): Promise<{ slug: string; name: string; city: string }[]> {
  if (!query || query.length < 2) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("slug, name_fr, city")
    .is("merchant_id", null)
    .neq("claim_status", "pending")
    .eq("is_published", true)
    .ilike("name_fr", `%${query}%`)
    .limit(10) as { data: { slug: string; name_fr: string; city: string }[] | null; error: unknown };

  if (error || !data) return [];
  return data.map((r) => ({ slug: r.slug, name: r.name_fr, city: r.city }));
}

// ────────────────────────────────────────────────────────────────────────────
// PR 2: Additional actions for multi-step signup flow
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get a merchant's ID by their email. Used by the signup flow to retrieve
 * the merchant ID after account creation (registerMerchant doesn't return it).
 */
export async function getMerchantIdByEmail(email: string): Promise<string | null> {
  if (!email) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("merchants")
    .select("id")
    .eq("email", email)
    .single() as { data: { id: string } | null; error: unknown };

  return data?.id || null;
}

/**
 * Cœur partagé de création d'une demande de revendication (claim_request).
 *
 * ⚠️ `merchantId` DOIT avoir été validé par l'appelant (dérivé de la session
 * authentifiée) — cette fonction ne fait AUCUNE vérification d'identité.
 *
 * `forceManualReview: true` désactive complètement l'auto-approbation par
 * correspondance d'email (`method='email_domain'`) : le claim est TOUJOURS
 * créé en `pending` / `method='manual'`, quelle que soit la correspondance
 * d'email. Utilisé par le parcours "revendiquer une fiche existante" depuis
 * l'espace-client, où la validation admin manuelle est obligatoire.
 */
export async function createClaimRequestCore(params: {
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantSlug: string;
  forceManualReview?: boolean;
  /**
   * Restaurant déjà chargé par l'appelant (évite une relecture en base —
   * ex: `claimExistingRestaurant` a déjà lu la fiche pour ses propres
   * vérifications). Doit correspondre à `restaurantSlug`. Si absent, la
   * fonction charge elle-même le restaurant.
   */
  preloadedRestaurant?: {
    id: string;
    name_fr: string;
    email: string | null;
    merchant_id: string | null;
  };
}): Promise<{ success: boolean; error: string | null; claimId?: string; status?: "pending" | "approved" }> {
  const { merchantId, merchantName, merchantEmail, merchantPhone, restaurantSlug, forceManualReview = false, preloadedRestaurant } = params;

  const supabase = createAdminClient();

  // Get restaurant (sauf si déjà chargé par l'appelant)
  let restaurant = preloadedRestaurant ?? null;
  if (!restaurant) {
    const { data } = await supabase
      .from("restaurants")
      .select("id, name_fr, email, merchant_id")
      .eq("slug", restaurantSlug)
      .single() as { data: { id: string; name_fr: string; email: string | null; merchant_id: string | null } | null; error: unknown };
    restaurant = data;
  }

  if (!restaurant) {
    return { success: false, error: "Restaurant introuvable" };
  }

  if (restaurant.merchant_id) {
    return { success: false, error: "Ce restaurant est déjà revendiqué par un autre compte" };
  }

  // Auto-approve si l'email du merchant correspond à l'email du restaurant en base
  // (preuve de propriété : seul le vrai proprio a accès à cet email)
  // — sauf si `forceManualReview` est demandé : dans ce cas la validation
  // admin manuelle est systématique, sans aucune exception.
  const emailMatch = !forceManualReview
    && restaurant.email
    && merchantEmail
    && restaurant.email.toLowerCase().trim() === merchantEmail.toLowerCase().trim();

  const claimStatus: "pending" | "approved" = emailMatch ? "approved" : "pending";
  const claimMethod = emailMatch ? "email_domain" : "manual";

  // ── Verrou atomique anti-vol de fiche (race condition) ────────────────
  // On ne réserve la fiche QUE si elle est encore libre (claim_status
  // 'unclaimed' ET merchant_id NULL). L'UPDATE conditionnel est atomique
  // au niveau PostgreSQL : si deux marchands tentent de revendiquer la
  // même fiche en même temps, un seul verra `lockedRows.length > 0`.
  // Le claim n'est créé QUE si ce verrou a réussi.
  const normalizedPhone = merchantPhone ? merchantPhone.replace(/[^0-9+]/g, "") : null;
  const lockUpdate: Record<string, unknown> = emailMatch
    ? {
        merchant_id: merchantId,
        claim_status: "claimed",
        claimed_at: new Date().toISOString(),
        whatsapp_phone: normalizedPhone,
      }
    : { claim_status: "pending" };

  const { data: lockedRows, error: lockError } = await (supabase
    .from("restaurants") as ReturnType<typeof supabase.from>)
    .update(lockUpdate)
    .eq("id", restaurant.id)
    .eq("claim_status", "unclaimed")
    .is("merchant_id", null)
    .select("id");

  if (lockError) {
    console.error("Failed to lock restaurant for claim:", lockError);
    return { success: false, error: "Erreur lors de la revendication" };
  }

  if (!lockedRows || lockedRows.length === 0) {
    // Une autre demande a gagné la course entre-temps.
    return { success: false, error: "Cette fiche est déjà en cours de revendication" };
  }

  // ── F3 : verrou → (delete) → insert sous try/catch ─────────────────────
  // À partir d'ici, la fiche est verrouillée (lockedRows.length > 0). Toute
  // exception non gérée dans cette séquence doit relâcher le verrou pour ne
  // pas laisser la fiche bloquée sans aucune demande associée.
  let claimId: string | undefined;
  try {
    // Nettoyage retry : si une précédente demande de ce marchand pour ce
    // restaurant a été rejetée, on la supprime — sinon la contrainte
    // UNIQUE(restaurant_id, merchant_id) bloquerait définitivement tout
    // nouvel essai de ce marchand sur cette fiche.
    const { error: deleteRejectedError } = await (supabase
      .from("claim_requests") as ReturnType<typeof supabase.from>)
      .delete()
      .eq("restaurant_id", restaurant.id)
      .eq("merchant_id", merchantId)
      .eq("status", "rejected");

    // F2 : si ce nettoyage échoue, on le mémorise pour ne pas afficher un
    // message trompeur en cas de 23505 juste après (le duplicate pourrait
    // alors venir de la ligne "rejected" non supprimée, pas d'une demande
    // réellement en cours).
    const rejectedCleanupFailed = !!deleteRejectedError;
    if (deleteRejectedError) {
      console.error("Failed to clean up previous rejected claim:", deleteRejectedError);
      // Non bloquant : on tente quand même l'insert ci-dessous.
    }

    // Create claim request
    const { data: claimRequest, error: claimError } = await (supabase
      .from("claim_requests") as ReturnType<typeof supabase.from>)
      .insert({
        restaurant_id: restaurant.id,
        merchant_id: merchantId,
        method: claimMethod,
        status: claimStatus,
        resolved_at: emailMatch ? new Date().toISOString() : null,
        admin_notes: emailMatch ? "Auto-approuvé : email du merchant correspond à l'email du restaurant en base" : null,
      } as Record<string, unknown>)
      .select("id")
      .single();

    if (claimError) {
      console.error("Claim request insert error:", claimError);

      // Code Postgres 23505 = violation de contrainte unique (duplicate key)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isDuplicateKey = (claimError as any)?.code === "23505";
      if (isDuplicateKey && rejectedCleanupFailed) {
        // F2 : le nettoyage des demandes rejetées a échoué juste avant — on
        // ne peut pas affirmer qu'une demande est "déjà en cours" (il peut
        // s'agir d'un reliquat rejeté non supprimé). Message honnête plutôt
        // que trompeur.
        throw Object.assign(new Error("rejected_cleanup_failed"), {
          userMessage: "Une erreur technique empêche de traiter votre demande pour cette fiche. Veuillez réessayer dans quelques instants.",
        });
      }
      if (isDuplicateKey) {
        throw Object.assign(new Error("duplicate_claim"), {
          userMessage: "Une demande est déjà en cours pour cette fiche",
        });
      }
      throw Object.assign(new Error("claim_insert_failed"), {
        userMessage: "Erreur lors de la revendication",
      });
    }

    claimId = claimRequest ? (claimRequest as Record<string, unknown>).id as string : undefined;
  } catch (err) {
    // Le verrou ci-dessus vient de modifier la fiche (claim_status et,
    // pour l'auto-approbation, merchant_id) : que l'échec vienne d'une
    // erreur gérée (claimError) ou d'une exception inattendue, on relâche
    // le verrou pour ne pas laisser une fiche bloquée sans aucune demande
    // associée (on sait que merchant_id était NULL avant le verrou, cf.
    // vérification `restaurant.merchant_id` ci-dessus — la fiche n'a été
    // verrouillée QUE par cet appel).
    await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
      .update({
        claim_status: "unclaimed",
        merchant_id: null,
        claimed_at: null,
      } as Record<string, unknown>)
      .eq("id", restaurant.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMessage = (err as any)?.userMessage as string | undefined;
    return { success: false, error: userMessage || "Erreur lors de la revendication" };
  }

  if (emailMatch) {
    // Auto-approve : le restaurant est déjà lié au merchant (verrou ci-dessus).
    // Notifier le merchant que sa fiche est validée
    try {
      const template = claimApprovedNotification({
        restaurantName: restaurant.name_fr,
        merchantName,
      });
      await sendEmail({
        to: merchantEmail,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailErr) {
      console.error("Failed to send auto-approval email:", emailErr);
    }

    // Notifier aussi l'admin (pour info)
    try {
      const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
      const template = claimRequestAdminNotification({
        restaurantName: restaurant.name_fr,
        merchantName,
        merchantEmail,
        merchantPhone: merchantPhone || "Non renseigné",
        claimId: claimId || "unknown",
      });
      await sendEmail({
        to: adminEmailAddress,
        subject: `[AUTO-APPROUVÉ] ${template.subject}`,
        html: template.html,
        replyTo: merchantEmail,
      });
    } catch (emailErr) {
      console.error("Failed to send admin notification:", emailErr);
    }
  } else {
    // Claim en attente : le restaurant est déjà en claim_status='pending'
    // (verrou ci-dessus). Validation manuelle par l'admin.
    // Notifier l'admin pour validation
    try {
      const adminEmailAddress = process.env.ADMIN_EMAIL || "contact@just-tag.app";
      const template = claimRequestAdminNotification({
        restaurantName: restaurant.name_fr,
        merchantName,
        merchantEmail,
        merchantPhone: merchantPhone || "Non renseigné",
        claimId: claimId || "unknown",
      });
      await sendEmail({
        to: adminEmailAddress,
        subject: template.subject,
        html: template.html,
        replyTo: merchantEmail,
      });
    } catch (emailErr) {
      console.error("Failed to send claim admin notification:", emailErr);
    }
  }

  return { success: true, error: null, claimId, status: claimStatus as "pending" | "approved" };
}

/**
 * Create a claim request for an existing merchant (already created via registerMerchant).
 * This is the separated claim step in the multi-step flow.
 *
 * ⚠️ Historique : cette fonction reste utilisable telle quelle (elle applique
 * l'auto-approbation `email_domain` quand l'email correspond). Elle N'EST PAS
 * utilisée par le parcours "revendiquer une fiche depuis l'espace-client"
 * (voir `claimExistingRestaurant` dans `merchant/restaurant.ts`), qui exige
 * une validation admin manuelle systématique via `createClaimRequestCore(...,
 * { forceManualReview: true })`.
 */
export async function createClaimRequest(params: {
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantSlug: string;
}): Promise<{ success: boolean; error: string | null }> {
  const { success, error } = await createClaimRequestCore(params);
  return { success, error };
}

/**
 * Create a new restaurant record linked to a merchant (is_published = false).
 * Used when the merchant's restaurant is not found in the search.
 */
export async function createRestaurantForMerchant(params: {
  merchantId: string;
  name: string;
  city: string;
  cuisine: string;
}): Promise<{ success: boolean; error: string | null; restaurantId?: string }> {
  const { merchantId, name, city, cuisine } = params;

  if (!name || !city) {
    return { success: false, error: "Nom et ville requis" };
  }

  const supabase = createAdminClient();

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Get merchant phone for WhatsApp
  const { data: merchantData } = await supabase
    .from("merchants")
    .select("phone")
    .eq("id", merchantId)
    .single() as { data: { phone: string | null } | null; error: unknown };
  const whatsappPhone = merchantData?.phone ? merchantData.phone.replace(/[^0-9+]/g, "") : null;

  const { data: restaurant, error } = await (supabase.from("restaurants") as ReturnType<typeof supabase.from>)
    .insert({
      merchant_id: merchantId,
      name_fr: name,
      name_de: name,
      name_en: name,
      slug: `${slug}-${Date.now().toString(36)}`,
      cuisine_type: cuisine || null,
      canton: "",
      city,
      is_published: false,
      claim_status: "claimed",
      whatsapp_phone: whatsappPhone,
    } as Record<string, unknown>)
    .select("id")
    .single();

  if (error) {
    console.error("Create restaurant error:", error);
    return { success: false, error: "Erreur lors de la création du restaurant" };
  }

  const restaurantId = restaurant ? (restaurant as Record<string, unknown>).id as string : undefined;
  return { success: true, error: null, restaurantId };
}
