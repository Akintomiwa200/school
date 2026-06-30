import { AccountantAuditDetail } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ auditId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { auditId } = await params;
  return <AccountantAuditDetail auditId={auditId} />;
}
