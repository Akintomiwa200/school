import { AdmissionsStatusPage } from "@/components/admissions/admissions-status-page";
import { MarketingPageHero } from "@/components/marketing/page-hero";

type PageProps = { params: Promise<{ reference: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { reference } = await params;
  return {
    title: `Application ${decodeURIComponent(reference)}`,
    description: "Track your admission application and print your exam slip.",
  };
}

export default async function Page({ params }: PageProps) {
  const { reference } = await params;
  return (
    <>
      <MarketingPageHero
        badge="Track application"
        title="Admission status"
        description="View payment status, examination details, and print your entrance slip."
      />
      <section className="pb-section lg:pb-24">
        <div className="container-content">
          <AdmissionsStatusPage reference={decodeURIComponent(reference)} />
        </div>
      </section>
    </>
  );
}
