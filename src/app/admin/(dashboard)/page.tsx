import { getDashboardStats } from "@/actions/admin/dashboard";
import { StatsCard } from "@/components/admin/StatsCard";
import { UtensilsCrossed, Store, Briefcase, ShieldCheck, MessageSquare, Mail, Newspaper } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground">Bienvenue dans l&apos;administration Just-Tag</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Restaurants" value={stats.totalRestaurants} icon={UtensilsCrossed} />
        <StatsCard title="Commerçants actifs" value={stats.activeMerchants} icon={Store} />
        <StatsCard title="Demandes B2B en attente" value={stats.pendingB2BRequests} icon={Briefcase} />
        <StatsCard title="Claims en attente" value={stats.pendingClaims} icon={ShieldCheck} />
        <StatsCard title="Avis publiés" value={stats.recentReviews} icon={MessageSquare} />
        <StatsCard title="Messages contact" value={stats.totalContacts} icon={Mail} />
        <StatsCard title="Abonnés newsletter" value={stats.totalSubscribers} icon={Newspaper} />
      </div>
    </div>
  );
}
