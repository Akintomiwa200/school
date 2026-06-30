import { TeacherAssignmentDetail } from "@/components/dashboard/teacher/teacher-assignment-detail";

type PageProps = { params: Promise<{ assignmentId: string }> };

export default async function Page({ params }: PageProps) {
  const { assignmentId } = await params;
  return <TeacherAssignmentDetail assignmentId={assignmentId} />;
}
