import { AccountantInvoiceDetail } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { invoiceId } = await params;
  return <AccountantInvoiceDetail invoiceId={invoiceId} />;
}
