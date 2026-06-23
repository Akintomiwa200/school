import { StudentAttendanceMarkSession, StudentAttendanceShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <StudentAttendanceShell showActions={false}>
      <StudentAttendanceMarkSession sessionId={sessionId} />
    </StudentAttendanceShell>
  );
}
