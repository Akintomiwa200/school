import { TeacherCourseDetail } from "@/components/dashboard/teacher/teacher-course-detail";

type PageProps = { params: Promise<{ courseId: string }> };

export default async function Page({ params }: PageProps) {
  const { courseId } = await params;
  return <TeacherCourseDetail courseId={courseId} />;
}
