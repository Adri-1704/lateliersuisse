import { HeroSection } from "@/components/home/HeroSection";
import { RestaurantOfMonth } from "@/components/home/RestaurantOfMonth";
import { SwissCantonMap } from "@/components/home/SwissCantonMap";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { StatsSection } from "@/components/home/StatsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { createAdminClient } from "@/lib/supabase/server";

async function getCantonCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("canton")
      .eq("is_published", true);

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    for (const row of data as { canton: string }[]) {
      const canton = row.canton;
      if (canton) {
        counts[canton] = (counts[canton] || 0) + 1;
      }
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const cantonCounts = await getCantonCounts();

  return (
    <>
      <HeroSection />
      <RestaurantOfMonth />
      <SwissCantonMap restaurantCounts={cantonCounts} />
      <CategoryGrid />
      <CollectionsSection />
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
