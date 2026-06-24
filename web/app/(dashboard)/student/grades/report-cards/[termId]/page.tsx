import { StudentGradesReportCardDetail, StudentGradesShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ termId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { termId } = await params;

  return (
    <StudentGradesShell showActions={false}>
      <StudentGradesReportCardDetail termId={termId} />
    </StudentGradesShell>
  );
}
