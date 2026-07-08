import { getMerchantSession } from "@/actions/merchant/auth";
import { Star, MessageSquare, Eye, UtensilsCrossed, ArrowRight, Clock, Mail, ExternalLink, ImageIcon, MessageCircle, Tag, Sparkles, BarChart3 } from "lucide-react";
import Link from "next/link";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "À vie ✦",
};

export default async function MerchantDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getMerchantSession();

  const merchant = session?.merchant;
  const subscription = session?.subscription;
  const restaurant = session?.restaurant;
  const pendingClaim = session?.pendingClaim;

  const base = `/${locale}/espace-client`;

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Bonjour{merchant?.name ? `, ${merchant.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {restaurant?.name_fr
              ? `Voici le tableau de bord de ${restaurant.name_fr}`
              : "Bienvenue dans votre espace restaurant"}
          </p>
        </div>
        {restaurant?.slug && (
          <a
            href={`/${locale}/restaurants/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
          >
            Ma fiche publique
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Pending claim */}
      {!restaurant && pendingClaim && (
        <div
          className="rounded-2xl p-6 text-center space-y-3"
          style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#fef3c7" }}>
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-amber-900">Demande de revendication en cours</h2>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            Notre équipe valide votre demande dans les 24h. Vous recevrez un email de confirmation.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-600 pt-1">
            <Mail className="h-3.5 w-3.5" />
            <span>{merchant?.email}</span>
          </div>
        </div>
      )}

      {!(pendingClaim && !restaurant) && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Note moyenne"
              value={restaurant?.avg_rating ? `${restaurant.avg_rating.toFixed(1)} ★` : "—"}
              sub="sur 5"
              color="#f59e0b"
              gradient="linear-gradient(135deg, #fffbeb, #fef3c7)"
              icon={<Star className="h-5 w-5" style={{ color: "#f59e0b" }} />}
            />
            <StatCard
              label="Avis clients"
              value={String(restaurant?.review_count || 0)}
              sub="avis reçus"
              color="#3b82f6"
              gradient="linear-gradient(135deg, #eff6ff, #dbeafe)"
              icon={<MessageSquare className="h-5 w-5" style={{ color: "#3b82f6" }} />}
            />
            <StatCard
              label="Fiche"
              value={restaurant?.is_published ? "Publiée" : "Brouillon"}
              sub={restaurant?.city || ""}
              color="#10b981"
              gradient="linear-gradient(135deg, #f0fdf4, #dcfce7)"
              icon={<Eye className="h-5 w-5" style={{ color: "#10b981" }} />}
            />
            <StatCard
              label="Abonnement"
              value={subscription ? (planLabels[subscription.plan_type] || subscription.plan_type) : "—"}
              sub={subscription?.status === "active" ? "Actif" : subscription?.status || "Aucun"}
              color="#e85d26"
              gradient="linear-gradient(135deg, #fff3ee, #ffe4d6)"
              icon={<UtensilsCrossed className="h-5 w-5" style={{ color: "#e85d26" }} />}
            />
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Accès rapide</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ActionCard href={`${base}/whatsapp`}    icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp"          sub="Envoyer un message"        color="#25D366" />
              <ActionCard href={`${base}/mon-restaurant`} icon={<UtensilsCrossed className="h-5 w-5" />} label="Mon restaurant" sub="Modifier ma fiche"       color="#e85d26" />
              <ActionCard href={`${base}/photos`}      icon={<ImageIcon className="h-5 w-5" />}       label="Photos"          sub="Gérer les images"          color="#ec4899" />
              <ActionCard href={`${base}/carte`}       icon={<Tag className="h-5 w-5" />}              label="Carte"           sub="Plats & menus"             color="#8b5cf6" />
              <ActionCard href={`${base}/avis`}        icon={<MessageSquare className="h-5 w-5" />}    label="Avis clients"    sub="Répondre aux avis"         color="#f59e0b" />
              <ActionCard href={`${base}/statistiques`} icon={<BarChart3 className="h-5 w-5" />}       label="Statistiques"    sub="Vues de votre fiche"       color="#3b82f6" />
            </div>
          </div>

          {/* Happy Hours promo */}
          <div
            className="flex items-center gap-5 rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", border: "1.5px solid #fed7aa" }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
            >
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-orange-900">Happy Hours &amp; offres flash</p>
              <p className="text-sm text-orange-700">Remplissez vos créneaux creux avec des promotions ciblées</p>
            </div>
            <Link
              href={`${base}/happy-hours`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#f97316" }}
            >
              Créer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label, value, sub, color, gradient, icon,
}: {
  label: string; value: string; sub: string; color: string; gradient: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: gradient, border: `1.5px solid ${color}22` }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight" style={{ color: "#0f1117" }}>{value}</p>
      <p className="mt-0.5 text-[12px]" style={{ color: `${color}cc` }}>{sub}</p>
    </div>
  );
}

function ActionCard({
  href, icon, label, sub, color,
}: {
  href: string; icon: React.ReactNode; label: string; sub: string; color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ background: "#fff", border: "1.5px solid #eaecf0" }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-[12px] text-gray-400">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500" />
    </Link>
  );
}
