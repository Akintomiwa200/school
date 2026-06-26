import { AdmissionsApplyWizard } from "@/components/admissions/admissions-apply-wizard";
import { MarketingPageHero } from "@/components/marketing/page-hero";

export const metadata = {
  title: "Apply for admission",
  description: "Submit your secondary or university application online.",
};

export default function AdmissionsApplyPage() {
  return (
    <>
      <MarketingPageHero
        badge="Apply"
        title="Online admission application"
        description="Choose secondary or university intake, submit your details, pay the application fee, and track your examination slip."
      />
      <section className="pb-section lg:pb-24">
        <div className="container-content">
          <AdmissionsApplyWizard />
        </div>
      </section>
    </>
  );
}
