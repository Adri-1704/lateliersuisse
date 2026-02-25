/**
 * Email templates for Just-Tag.ch
 * All templates return { subject, html } and support 5 locales.
 */

type Locale = "fr" | "de" | "en" | "pt" | "es";

// ---------------------------------------------------------------------------
// Brand colors
// ---------------------------------------------------------------------------
const COLORS = {
  red: "#ff3c48",
  green: "#2d6a4f",
  cream: "#faf8f5",
  darkText: "#1f2937",
  lightText: "#6b7280",
  white: "#ffffff",
};

// ---------------------------------------------------------------------------
// Base HTML layout
// ---------------------------------------------------------------------------
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Just-Tag</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLORS.white};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${COLORS.white};padding:24px 32px;border-bottom:3px solid ${COLORS.red};">
              <span style="font-size:24px;font-weight:800;color:${COLORS.red};letter-spacing:-0.5px;">Just</span><span style="font-size:24px;font-weight:800;color:${COLORS.darkText};letter-spacing:-0.5px;">-Tag</span>
              <span style="font-size:12px;color:${COLORS.lightText};margin-left:8px;">🇨🇭</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${COLORS.cream};padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:${COLORS.lightText};text-align:center;">
                <a href="https://just-tag.ch" style="color:${COLORS.green};text-decoration:none;font-weight:600;">just-tag.ch</a>
                &nbsp;·&nbsp; Made in Switzerland 🇨🇭
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:${COLORS.red};border-radius:8px;padding:12px 28px;">
        <a href="${url}" style="color:${COLORS.white};text-decoration:none;font-weight:600;font-size:14px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${COLORS.darkText};">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${COLORS.darkText};">${text}</p>`;
}

function label(text: string, value: string): string {
  return `<p style="margin:0 0 6px;font-size:14px;color:${COLORS.darkText};"><strong style="color:${COLORS.lightText};">${text} :</strong> ${value}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>`;
}

// ---------------------------------------------------------------------------
// Localization dictionaries
// ---------------------------------------------------------------------------
const t = {
  b2bConfirmation: {
    fr: {
      subject: "Votre demande a bien été reçue — Just-Tag",
      title: "Merci pour votre intérêt !",
      body: "Nous avons bien reçu votre demande de contact. Un membre de notre équipe vous recontactera sous 24 heures.",
      details: "Récapitulatif de votre demande",
      cta: "Découvrir Just-Tag",
    },
    de: {
      subject: "Ihre Anfrage wurde erhalten — Just-Tag",
      title: "Vielen Dank für Ihr Interesse!",
      body: "Wir haben Ihre Kontaktanfrage erhalten. Ein Mitglied unseres Teams wird Sie innerhalb von 24 Stunden kontaktieren.",
      details: "Zusammenfassung Ihrer Anfrage",
      cta: "Just-Tag entdecken",
    },
    en: {
      subject: "Your request has been received — Just-Tag",
      title: "Thank you for your interest!",
      body: "We have received your contact request. A member of our team will get back to you within 24 hours.",
      details: "Summary of your request",
      cta: "Discover Just-Tag",
    },
    pt: {
      subject: "O seu pedido foi recebido — Just-Tag",
      title: "Obrigado pelo seu interesse!",
      body: "Recebemos o seu pedido de contacto. Um membro da nossa equipa entrará em contacto consigo dentro de 24 horas.",
      details: "Resumo do seu pedido",
      cta: "Descobrir Just-Tag",
    },
    es: {
      subject: "Su solicitud ha sido recibida — Just-Tag",
      title: "¡Gracias por su interés!",
      body: "Hemos recibido su solicitud de contacto. Un miembro de nuestro equipo se pondrá en contacto con usted en 24 horas.",
      details: "Resumen de su solicitud",
      cta: "Descubrir Just-Tag",
    },
  },
  newsletterWelcome: {
    fr: {
      subject: "Bienvenue dans la communauté Just-Tag ! 🇨🇭",
      title: "Bienvenue !",
      body: "Merci de vous être inscrit à la newsletter Just-Tag. Vous recevrez les meilleures adresses de restaurants en Suisse, directement dans votre boîte mail.",
      cta: "Explorer les restaurants",
    },
    de: {
      subject: "Willkommen bei Just-Tag! 🇨🇭",
      title: "Willkommen!",
      body: "Vielen Dank für Ihre Anmeldung zum Just-Tag Newsletter. Sie erhalten die besten Restaurant-Empfehlungen der Schweiz direkt in Ihr Postfach.",
      cta: "Restaurants entdecken",
    },
    en: {
      subject: "Welcome to Just-Tag! 🇨🇭",
      title: "Welcome!",
      body: "Thank you for subscribing to the Just-Tag newsletter. You will receive the best restaurant recommendations in Switzerland, straight to your inbox.",
      cta: "Explore restaurants",
    },
    pt: {
      subject: "Bem-vindo ao Just-Tag! 🇨🇭",
      title: "Bem-vindo!",
      body: "Obrigado por se inscrever na newsletter Just-Tag. Receberá as melhores recomendações de restaurantes na Suíça, diretamente na sua caixa de correio.",
      cta: "Explorar restaurantes",
    },
    es: {
      subject: "¡Bienvenido a Just-Tag! 🇨🇭",
      title: "¡Bienvenido!",
      body: "Gracias por suscribirse al boletín de Just-Tag. Recibirá las mejores recomendaciones de restaurantes en Suiza, directamente en su bandeja de entrada.",
      cta: "Explorar restaurantes",
    },
  },
  paymentConfirmation: {
    fr: {
      subject: "Votre abonnement Just-Tag est activé ! 🎉",
      title: "Bienvenue parmi nos partenaires !",
      body: "Votre abonnement a été activé avec succès. Votre restaurant sera visible sur Just-Tag dès que votre fiche sera complétée.",
      plan: "Plan",
      restaurant: "Restaurant",
      nextSteps: "Prochaines étapes",
      step1: "Complétez votre fiche restaurant",
      step2: "Ajoutez vos photos et votre menu",
      step3: "Publiez et attirez de nouveaux clients",
      cta: "Accéder à mon espace",
    },
    de: {
      subject: "Ihr Just-Tag Abo ist aktiviert! 🎉",
      title: "Willkommen bei unseren Partnern!",
      body: "Ihr Abonnement wurde erfolgreich aktiviert. Ihr Restaurant wird auf Just-Tag sichtbar, sobald Ihr Profil vollständig ist.",
      plan: "Plan",
      restaurant: "Restaurant",
      nextSteps: "Nächste Schritte",
      step1: "Vervollständigen Sie Ihr Restaurantprofil",
      step2: "Fügen Sie Fotos und Menü hinzu",
      step3: "Veröffentlichen und gewinnen Sie neue Kunden",
      cta: "Zu meinem Bereich",
    },
    en: {
      subject: "Your Just-Tag subscription is active! 🎉",
      title: "Welcome to our partners!",
      body: "Your subscription has been successfully activated. Your restaurant will be visible on Just-Tag once your profile is completed.",
      plan: "Plan",
      restaurant: "Restaurant",
      nextSteps: "Next steps",
      step1: "Complete your restaurant profile",
      step2: "Add your photos and menu",
      step3: "Publish and attract new customers",
      cta: "Access my dashboard",
    },
    pt: {
      subject: "A sua assinatura Just-Tag está ativa! 🎉",
      title: "Bem-vindo aos nossos parceiros!",
      body: "A sua assinatura foi ativada com sucesso. O seu restaurante ficará visível no Just-Tag assim que o seu perfil estiver completo.",
      plan: "Plano",
      restaurant: "Restaurante",
      nextSteps: "Próximos passos",
      step1: "Complete o perfil do seu restaurante",
      step2: "Adicione fotos e menu",
      step3: "Publique e atraia novos clientes",
      cta: "Aceder ao meu espaço",
    },
    es: {
      subject: "¡Su suscripción Just-Tag está activa! 🎉",
      title: "¡Bienvenido a nuestros socios!",
      body: "Su suscripción se ha activado correctamente. Su restaurante será visible en Just-Tag una vez que complete su perfil.",
      plan: "Plan",
      restaurant: "Restaurante",
      nextSteps: "Próximos pasos",
      step1: "Complete el perfil de su restaurante",
      step2: "Añada fotos y menú",
      step3: "Publique y atraiga nuevos clientes",
      cta: "Acceder a mi espacio",
    },
  },
  contactConfirmation: {
    fr: {
      subject: "Nous avons bien reçu votre message — Just-Tag",
      title: "Message bien reçu !",
      body: "Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.",
      cta: "Retour au site",
    },
    de: {
      subject: "Wir haben Ihre Nachricht erhalten — Just-Tag",
      title: "Nachricht erhalten!",
      body: "Vielen Dank für Ihre Kontaktaufnahme. Unser Team wird Ihnen so schnell wie möglich antworten.",
      cta: "Zurück zur Website",
    },
    en: {
      subject: "We received your message — Just-Tag",
      title: "Message received!",
      body: "Thank you for contacting us. Our team will get back to you as soon as possible.",
      cta: "Back to website",
    },
    pt: {
      subject: "Recebemos a sua mensagem — Just-Tag",
      title: "Mensagem recebida!",
      body: "Obrigado por nos contactar. A nossa equipa responderá o mais brevemente possível.",
      cta: "Voltar ao site",
    },
    es: {
      subject: "Hemos recibido su mensaje — Just-Tag",
      title: "¡Mensaje recibido!",
      body: "Gracias por contactarnos. Nuestro equipo le responderá lo antes posible.",
      cta: "Volver al sitio",
    },
  },
};

function getLocale(locale: string): Locale {
  if (["fr", "de", "en", "pt", "es"].includes(locale)) return locale as Locale;
  return "fr";
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.ch";

// ---------------------------------------------------------------------------
// 1. B2B Admin Notification (always in French)
// ---------------------------------------------------------------------------
export interface B2BEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  restaurantName: string;
  city: string;
  message?: string;
  locale: string;
}

export function b2bAdminNotification(data: B2BEmailData): {
  subject: string;
  html: string;
} {
  const content = [
    heading("🔔 Nouvelle demande B2B"),
    paragraph(
      `Un restaurateur souhaite être contacté. Voici les détails :`
    ),
    divider(),
    label("Nom", `${data.firstName} ${data.lastName}`),
    label("Email", data.email),
    data.phone ? label("Téléphone", data.phone) : "",
    label("Restaurant", data.restaurantName),
    label("Ville", data.city),
    label("Langue", data.locale.toUpperCase()),
    data.message
      ? `${divider()}${label("Message", data.message)}`
      : "",
    divider(),
    paragraph(
      `<a href="mailto:${data.email}" style="color:${COLORS.red};font-weight:600;">Répondre par email</a>`
    ),
  ].join("");

  return {
    subject: `Nouvelle demande B2B — ${data.restaurantName} (${data.city})`,
    html: emailLayout(content),
  };
}

// ---------------------------------------------------------------------------
// 2. B2B Restaurateur Confirmation (localized)
// ---------------------------------------------------------------------------
export function b2bConfirmation(
  data: B2BEmailData,
  locale: string
): { subject: string; html: string } {
  const l = getLocale(locale);
  const tr = t.b2bConfirmation[l];

  const content = [
    heading(tr.title),
    paragraph(tr.body),
    divider(),
    `<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${COLORS.lightText};text-transform:uppercase;letter-spacing:0.5px;">${tr.details}</p>`,
    label(l === "de" ? "Name" : l === "en" ? "Name" : "Nom", `${data.firstName} ${data.lastName}`),
    label("Restaurant", data.restaurantName),
    label(l === "de" ? "Stadt" : l === "en" ? "City" : l === "pt" ? "Cidade" : l === "es" ? "Ciudad" : "Ville", data.city),
    button(`${siteUrl}/${l}/pour-restaurateurs`, tr.cta),
  ].join("");

  return { subject: tr.subject, html: emailLayout(content) };
}

// ---------------------------------------------------------------------------
// 3. Newsletter Welcome (localized)
// ---------------------------------------------------------------------------
export function newsletterWelcome(
  email: string,
  locale: string
): { subject: string; html: string } {
  const l = getLocale(locale);
  const tr = t.newsletterWelcome[l];

  const content = [
    heading(tr.title),
    paragraph(tr.body),
    button(`${siteUrl}/${l}/restaurants`, tr.cta),
  ].join("");

  return { subject: tr.subject, html: emailLayout(content) };
}

// ---------------------------------------------------------------------------
// 4. Stripe Payment Confirmation (localized)
// ---------------------------------------------------------------------------
export interface PaymentEmailData {
  merchantName: string;
  merchantEmail: string;
  restaurantName: string;
  planType: string;
}

const planLabels: Record<string, Record<Locale, string>> = {
  monthly: { fr: "Mensuel", de: "Monatlich", en: "Monthly", pt: "Mensal", es: "Mensual" },
  semiannual: { fr: "Semestriel", de: "Halbjährlich", en: "Semi-annual", pt: "Semestral", es: "Semestral" },
  annual: { fr: "Annuel", de: "Jährlich", en: "Annual", pt: "Anual", es: "Anual" },
  lifetime: { fr: "À vie", de: "Lebenslang", en: "Lifetime", pt: "Vitalício", es: "De por vida" },
};

export function paymentConfirmation(
  data: PaymentEmailData,
  locale: string
): { subject: string; html: string } {
  const l = getLocale(locale);
  const tr = t.paymentConfirmation[l];
  const planLabel = planLabels[data.planType]?.[l] || data.planType;

  const content = [
    heading(tr.title),
    paragraph(tr.body),
    divider(),
    label(tr.plan, planLabel),
    label(tr.restaurant, data.restaurantName),
    divider(),
    `<p style="margin:0 0 12px;font-size:15px;font-weight:700;color:${COLORS.green};">${tr.nextSteps}</p>`,
    `<ol style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:${COLORS.darkText};">
      <li>${tr.step1}</li>
      <li>${tr.step2}</li>
      <li>${tr.step3}</li>
    </ol>`,
    button(`${siteUrl}/${l}/partenaire-inscription/succes`, tr.cta),
  ].join("");

  return { subject: tr.subject, html: emailLayout(content) };
}

// ---------------------------------------------------------------------------
// 5. Merchant Welcome (localized) — sent after Stripe checkout
// ---------------------------------------------------------------------------
const merchantWelcomeT = {
  fr: {
    subject: "Bienvenue sur Just-Tag ! Configurez votre compte",
    title: "Bienvenue partenaire !",
    body: "Votre abonnement est actif. Cliquez sur le bouton ci-dessous pour configurer votre mot de passe et accéder à votre espace client.",
    cta: "Configurer mon mot de passe",
    footer: "Ce lien est valable 24 heures. Si vous n'avez pas initié cette inscription, ignorez cet email.",
  },
  de: {
    subject: "Willkommen bei Just-Tag! Richten Sie Ihr Konto ein",
    title: "Willkommen Partner!",
    body: "Ihr Abonnement ist aktiv. Klicken Sie auf die Schaltfläche unten, um Ihr Passwort festzulegen und auf Ihren Kundenbereich zuzugreifen.",
    cta: "Mein Passwort einrichten",
    footer: "Dieser Link ist 24 Stunden gültig. Wenn Sie diese Registrierung nicht veranlasst haben, ignorieren Sie diese E-Mail.",
  },
  en: {
    subject: "Welcome to Just-Tag! Set up your account",
    title: "Welcome partner!",
    body: "Your subscription is active. Click the button below to set your password and access your client dashboard.",
    cta: "Set my password",
    footer: "This link is valid for 24 hours. If you did not initiate this registration, please ignore this email.",
  },
  pt: {
    subject: "Bem-vindo ao Just-Tag! Configure a sua conta",
    title: "Bem-vindo parceiro!",
    body: "A sua assinatura está ativa. Clique no botão abaixo para definir a sua palavra-passe e aceder ao seu espaço de cliente.",
    cta: "Definir a minha palavra-passe",
    footer: "Este link é válido por 24 horas. Se não iniciou este registo, ignore este email.",
  },
  es: {
    subject: "¡Bienvenido a Just-Tag! Configure su cuenta",
    title: "¡Bienvenido socio!",
    body: "Su suscripción está activa. Haga clic en el botón de abajo para configurar su contraseña y acceder a su espacio de cliente.",
    cta: "Configurar mi contraseña",
    footer: "Este enlace es válido durante 24 horas. Si no ha iniciado este registro, ignore este correo electrónico.",
  },
};

export interface MerchantWelcomeData {
  merchantName: string;
  merchantEmail: string;
  restaurantName: string;
  passwordResetUrl: string;
}

export function merchantWelcome(
  data: MerchantWelcomeData,
  locale: string
): { subject: string; html: string } {
  const l = getLocale(locale);
  const tr = merchantWelcomeT[l];

  const content = [
    heading(tr.title),
    paragraph(tr.body),
    divider(),
    label(l === "de" ? "Name" : l === "en" ? "Name" : "Nom", data.merchantName),
    label("Restaurant", data.restaurantName),
    label("Email", data.merchantEmail),
    button(data.passwordResetUrl, tr.cta),
    `<p style="margin:16px 0 0;font-size:12px;color:${COLORS.lightText};line-height:1.5;">${tr.footer}</p>`,
  ].join("");

  return { subject: tr.subject, html: emailLayout(content) };
}

// ---------------------------------------------------------------------------
// 6. Contact Admin Notification (always in French)
// ---------------------------------------------------------------------------
export interface ContactEmailData {
  firstName: string;
  lastName: string;
  email: string;
  subject?: string;
  message: string;
}

export function contactAdminNotification(data: ContactEmailData): {
  subject: string;
  html: string;
} {
  const content = [
    heading("📩 Nouveau message de contact"),
    divider(),
    label("Nom", `${data.firstName} ${data.lastName}`),
    label("Email", data.email),
    data.subject ? label("Sujet", data.subject) : "",
    divider(),
    `<div style="background-color:${COLORS.cream};border-radius:8px;padding:16px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.darkText};">${data.message}</p>
    </div>`,
    paragraph(
      `<a href="mailto:${data.email}" style="color:${COLORS.red};font-weight:600;">Répondre par email</a>`
    ),
  ].join("");

  return {
    subject: `Nouveau message — ${data.subject || `${data.firstName} ${data.lastName}`}`,
    html: emailLayout(content),
  };
}

// ---------------------------------------------------------------------------
// 6. Contact User Confirmation (localized)
// ---------------------------------------------------------------------------
export function contactConfirmation(
  data: ContactEmailData,
  locale: string
): { subject: string; html: string } {
  const l = getLocale(locale);
  const tr = t.contactConfirmation[l];

  const content = [
    heading(tr.title),
    paragraph(tr.body),
    button(`${siteUrl}/${l}`, tr.cta),
  ].join("");

  return { subject: tr.subject, html: emailLayout(content) };
}
