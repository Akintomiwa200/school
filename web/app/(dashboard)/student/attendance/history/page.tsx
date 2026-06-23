import { StudentAttendance } from "@/components/dashboard";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { status } = await searchParams;
  return <StudentAttendance view="history" initialStatus={status} />;
}
