import { StudentFeesFeeDetail, StudentFeesShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ feeId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { feeId } = await params;

  return (
    <StudentFeesShell showActions={false}>
      <StudentFeesFeeDetail feeId={feeId} />
    </StudentFeesShell>
  );
}
