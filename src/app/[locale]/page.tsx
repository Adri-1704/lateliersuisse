import { HeroSection } from "@/components/home/HeroSection";
import { RestaurantOfMonth } from "@/components/home/RestaurantOfMonth";
import { SwissCantonMap } from "@/components/home/SwissCantonMap";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { StatsSection } from "@/components/home/StatsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <RestaurantOfMonth />
      <SwissCantonMap />
      <CategoryGrid />
      <CollectionsSection />
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
