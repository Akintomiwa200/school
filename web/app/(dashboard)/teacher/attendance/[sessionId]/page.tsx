import { TeacherAttendanceDetail } from "@/components/dashboard/teacher/teacher-attendance-detail";

type PageProps = { params: Promise<{ sessionId: string }> };

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <TeacherAttendanceDetail sessionId={sessionId} />;
}
