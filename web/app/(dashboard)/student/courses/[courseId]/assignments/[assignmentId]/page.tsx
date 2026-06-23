import { StudentCourseAssignment } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ courseId: string; assignmentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { courseId, assignmentId } = await params;
  return <StudentCourseAssignment courseId={courseId} assignmentId={assignmentId} />;
}
