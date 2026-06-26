import { AdminStaffDetail } from "@/components/dashboard/admin/admin-staff-detail";

type PageProps = {
  params: Promise<{ staffId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { staffId } = await params;
  return <AdminStaffDetail staffId={staffId} />;
}
