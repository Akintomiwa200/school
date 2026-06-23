import { StudentAttendanceRecord, StudentAttendanceShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ recordId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { recordId } = await params;

  return (
    <StudentAttendanceShell showActions={false}>
      <StudentAttendanceRecord recordId={recordId} />
    </StudentAttendanceShell>
  );
}
