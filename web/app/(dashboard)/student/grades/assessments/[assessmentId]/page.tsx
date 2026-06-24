import { StudentGradesAssessmentDetail, StudentGradesShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ assessmentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { assessmentId } = await params;

  return (
    <StudentGradesShell showActions={false}>
      <StudentGradesAssessmentDetail assessmentId={assessmentId} />
    </StudentGradesShell>
  );
}
