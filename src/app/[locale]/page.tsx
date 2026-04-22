import { HeroSection } from "@/components/home/HeroSection";
import { RestaurantOfMonth } from "@/components/home/RestaurantOfMonth";
import { SwissCantonMap } from "@/components/home/SwissCantonMap";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { StatsSection } from "@/components/home/StatsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { FounderSection } from "@/components/home/FounderSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { HappyHoursSection } from "@/components/home/HappyHoursSection";
import { createAdminClient } from "@/lib/supabase/server";
import { cantons } from "@/data/cantons";

// Map display names (with accents, caps) to slugs: "Genève" -> "geneve", "Bâle-Ville" -> "bale-ville"
function buildCantonNormalizer(): (raw: string) => string {
  const map: Record<string, string> = {};
  for (const c of cantons) {
    // Add all label variants pointing to the slug
    map[c.value] = c.value;
    map[c.label.toLowerCase()] = c.value;
    map[c.labelDe.toLowerCase()] = c.value;
    map[c.labelEn.toLowerCase()] = c.value;
    if ("labelPt" in c && c.labelPt) map[c.labelPt.toLowerCase()] = c.value;
    if ("labelEs" in c && c.labelEs) map[c.labelEs.toLowerCase()] = c.value;
  }
  // Add common variants with accents
  map["genève"] = "geneve";
  map["bâle-ville"] = "bale-ville";
  map["bâle-campagne"] = "bale-campagne";
  map["neuchâtel"] = "neuchatel";
  map["zürich"] = "zurich";

  return (raw: string) => {
    const lower = raw.toLowerCase().trim();
    return map[lower] || lower;
  };
}

async function getRestaurantCounts(): Promise<{ cantonCounts: Record<string, number>; cuisineCounts: Record<string, number>; totalReviews: number }> {
  try {
    const supabase = createAdminClient();
    const romandCantons = ["geneve", "vaud", "fribourg", "neuchatel", "valais", "jura", "berne"];

    // Count per canton via individual queries (bypasses 1000 row limit)
    const cantonCounts: Record<string, number> = {};
    const [, { count: reviewsCount }] = await Promise.all([
      Promise.all(
        romandCantons.map(async (canton) => {
          const { count } = await supabase
            .from("restaurants")
            .select("id", { count: "exact", head: true })
            .eq("is_published", true)
            .eq("canton", canton);
          cantonCounts[canton] = count || 0;
        })
      ),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);

    // Cuisine counts (use pagination to get all)
    const cuisineCounts: Record<string, number> = {};
    let offset = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase
        .from("restaurants")
        .select("cuisine_type")
        .eq("is_published", true)
        .not("cuisine_type", "is", null)
        .neq("cuisine_type", "")
        .range(offset, offset + pageSize - 1);
      if (!data || data.length === 0) break;
      for (const row of data as { cuisine_type: string }[]) {
        cuisineCounts[row.cuisine_type] = (cuisineCounts[row.cuisine_type] || 0) + 1;
      }
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    return { cantonCounts, cuisineCounts, totalReviews: reviewsCount ?? 0 };
  } catch {
    return { cantonCounts: {}, cuisineCounts: {}, totalReviews: 0 };
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { cantonCounts, cuisineCounts, totalReviews } = await getRestaurantCounts();
  const totalRestaurants = Object.values(cantonCounts).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <HeroSection totalRestaurants={totalRestaurants} cuisineCounts={cuisineCounts} />
      <RestaurantOfMonth />
      <HappyHoursSection locale={locale} />
      <SwissCantonMap restaurantCounts={cantonCounts} />
      <CategoryGrid cuisineCounts={cuisineCounts} />
      <CollectionsSection />
      <StatsSection totalRestaurants={totalRestaurants} totalReviews={totalReviews} />
      <HowItWorks />
      <Testimonials />
      <FounderSection />
      <NewsletterSection />
    </>
  );
}
