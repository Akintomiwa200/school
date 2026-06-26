import { AdminClassDetail } from "@/components/dashboard/admin/admin-class-detail";

type PageProps = {
  params: Promise<{ classId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { classId } = await params;
  return <AdminClassDetail classId={classId} />;
}
