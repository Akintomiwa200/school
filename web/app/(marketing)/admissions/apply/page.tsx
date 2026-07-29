import { AdmissionsApplyWizard } from "@/components/admissions/admissions-apply-wizard";

export const metadata = {
  title: "Apply for admission",
  description: "Submit your application online — details, documents, payment, and tracking.",
};

export default function AdmissionsApplyPage() {
  return (
    <section className="border-b border-marketing-grid/80 bg-marketing-bg py-10 lg:py-14">
      <div className="container-content">
        <AdmissionsApplyWizard />
      </div>
    </section>
  );
}
