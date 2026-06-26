import { AdminStudentDetail } from "@/components/dashboard/admin/admin-student-detail";

type PageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { studentId } = await params;
  return <AdminStudentDetail studentId={studentId} />;
}
