import { StudentGradesCourseDetail, StudentGradesShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { courseId } = await params;

  return (
    <StudentGradesShell showActions={false}>
      <StudentGradesCourseDetail courseId={courseId} />
    </StudentGradesShell>
  );
}
