import { SuperAdminSchoolDetail } from "@/components/dashboard/super-admin/super-admin-school-detail";

type PageProps = { params: Promise<{ schoolId: string }> };

export default async function Page({ params }: PageProps) {
  const { schoolId } = await params;
  return <SuperAdminSchoolDetail schoolId={schoolId} />;
}
