import { AccountantPayrollDetail } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { runId } = await params;
  return <AccountantPayrollDetail runId={runId} />;
}
