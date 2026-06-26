import { AdminAdmissionDetail } from "@/components/dashboard/admin/admin-admission-detail";

type PageProps = {
  params: Promise<{ admissionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { admissionId } = await params;
  return <AdminAdmissionDetail admissionId={admissionId} />;
}
