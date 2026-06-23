import { StudentFeesPaymentDetail, StudentFeesShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ paymentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { paymentId } = await params;

  return (
    <StudentFeesShell showActions={false}>
      <StudentFeesPaymentDetail paymentId={paymentId} />
    </StudentFeesShell>
  );
}
