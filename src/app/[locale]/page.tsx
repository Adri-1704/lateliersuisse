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

async function getRestaurantCounts(): Promise<{ cantonCounts: Record<string, number>; cuisineCounts: Record<string, number> }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("canton, cuisine_type")
      .eq("is_published", true);

    if (error || !data) return { cantonCounts: {}, cuisineCounts: {} };

    const cantonCounts: Record<string, number> = {};
    const cuisineCounts: Record<string, number> = {};

    for (const row of data as { canton: string; cuisine_type: string | null }[]) {
      if (row.canton) {
        cantonCounts[row.canton] = (cantonCounts[row.canton] || 0) + 1;
      }
      if (row.cuisine_type) {
        cuisineCounts[row.cuisine_type] = (cuisineCounts[row.cuisine_type] || 0) + 1;
      }
    }
    return { cantonCounts, cuisineCounts };
  } catch {
    return { cantonCounts: {}, cuisineCounts: {} };
  }
}

export default async function HomePage() {
  const { cantonCounts, cuisineCounts } = await getRestaurantCounts();

  return (
    <>
      <HeroSection />
      <RestaurantOfMonth />
      <SwissCantonMap restaurantCounts={cantonCounts} />
      <CategoryGrid cuisineCounts={cuisineCounts} />
      <CollectionsSection />
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
