import { StudentCourseLesson } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { courseId, lessonId } = await params;
  return <StudentCourseLesson courseId={courseId} lessonId={lessonId} />;
}
