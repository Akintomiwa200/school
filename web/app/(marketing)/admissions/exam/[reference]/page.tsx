import { AdmissionsExamPortal } from "@/components/admissions/admissions-exam-portal";
import { MarketingPageHero } from "@/components/marketing/page-hero";

type PageProps = { params: Promise<{ reference: string }> };

export default async function Page({ params }: PageProps) {
  const { reference } = await params;
  return (
    <>
      <MarketingPageHero
        badge="Entrance exam"
        title="Computer-based test"
        description="Complete your scheduled examination in one sitting. Do not refresh the page during the test."
      />
      <section className="pb-section lg:pb-24">
        <div className="container-content">
          <AdmissionsExamPortal reference={decodeURIComponent(reference)} />
        </div>
      </section>
    </>
  );
}
