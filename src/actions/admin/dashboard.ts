"use server";

import { createAdminClient } from "@/lib/supabase/server";

interface DashboardStats {
  totalRestaurants: number;
  activeMerchants: number;
  pendingB2BRequests: number;
  recentReviews: number;
  totalContacts: number;
  totalSubscribers: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = createAdminClient();

    const [restaurants, merchants, b2bRequests, reviews, contacts, subscribers] =
      await Promise.all([
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("b2b_contact_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
        supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

    return {
      totalRestaurants: restaurants.count || 0,
      activeMerchants: merchants.count || 0,
      pendingB2BRequests: b2bRequests.count || 0,
      recentReviews: reviews.count || 0,
      totalContacts: contacts.count || 0,
      totalSubscribers: subscribers.count || 0,
    };
  } catch {
    // Fallback mock data when Supabase is not configured
    return {
      totalRestaurants: 8,
      activeMerchants: 3,
      pendingB2BRequests: 5,
      recentReviews: 24,
      totalContacts: 12,
      totalSubscribers: 156,
    };
  }
}
