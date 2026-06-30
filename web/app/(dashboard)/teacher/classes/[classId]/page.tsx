import { TeacherClassDetail } from "@/components/dashboard/teacher/teacher-class-detail";

type PageProps = { params: Promise<{ classId: string }> };

export default async function Page({ params }: PageProps) {
  const { classId } = await params;
  return <TeacherClassDetail classId={classId} />;
}
