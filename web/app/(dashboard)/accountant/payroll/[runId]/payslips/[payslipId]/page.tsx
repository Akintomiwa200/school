import { AccountantPayslipDetail } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ runId: string; payslipId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { runId, payslipId } = await params;
  return <AccountantPayslipDetail runId={runId} payslipId={payslipId} />;
}
