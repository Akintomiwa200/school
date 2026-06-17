import {
  MarketingArticles,
  MarketingCta,
  MarketingFooter,
  MarketingHero,
  MarketingNavbar,
  MarketingOffering,
  MarketingServices,
  MarketingTestimonials,
} from "@/components/marketing";

export default function HomePage() {
  return (
    <div className="marketing-page">
      <MarketingNavbar />
      <MarketingHero />
      <MarketingServices />
      <MarketingOffering />
      <MarketingTestimonials />
      <MarketingArticles />
      <MarketingCta />
      <MarketingFooter />
    </div>
  );
}
