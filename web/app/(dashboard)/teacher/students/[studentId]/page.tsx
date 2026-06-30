import { TeacherStudentDetail } from "@/components/dashboard/teacher/teacher-student-detail";

type PageProps = { params: Promise<{ studentId: string }> };

export default async function Page({ params }: PageProps) {
  const { studentId } = await params;
  return <TeacherStudentDetail studentId={studentId} />;
}
