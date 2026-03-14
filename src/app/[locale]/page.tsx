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

async function getRestaurantCounts(): Promise<{ cantonCounts: Record<string, number>; cuisineCounts: Record<string, number> }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("canton, cuisine_type")
      .eq("is_published", true);

    if (error || !data) return { cantonCounts: {}, cuisineCounts: {} };

    const normalize = buildCantonNormalizer();
    const cantonCounts: Record<string, number> = {};
    const cuisineCounts: Record<string, number> = {};

    for (const row of data as { canton: string; cuisine_type: string | null }[]) {
      if (row.canton) {
        const slug = normalize(row.canton);
        cantonCounts[slug] = (cantonCounts[slug] || 0) + 1;
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
  const totalRestaurants = Object.values(cantonCounts).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <HeroSection totalRestaurants={totalRestaurants} />
      <RestaurantOfMonth />
      <SwissCantonMap restaurantCounts={cantonCounts} />
      <CategoryGrid cuisineCounts={cuisineCounts} />
      <CollectionsSection />
      <StatsSection totalRestaurants={totalRestaurants} />
      <HowItWorks />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
