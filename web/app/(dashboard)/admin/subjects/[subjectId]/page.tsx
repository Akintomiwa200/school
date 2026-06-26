import { AdminSubjectDetail } from "@/components/dashboard/admin/admin-subject-detail";

type PageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { subjectId } = await params;
  return <AdminSubjectDetail subjectId={subjectId} />;
}
