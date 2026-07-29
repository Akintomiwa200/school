import { getAdmissionConfig } from "@/lib/api/admission-config-store";
import { AdmissionsPageContent } from "@/components/marketing/admissions-page-content";

export const metadata = {
  title: "Admissions",
  description: "Apply online — requirements, steps, and important dates.",
};

export default function AdmissionsPage() {
  const config = getAdmissionConfig();
  return <AdmissionsPageContent config={config} />;
}
