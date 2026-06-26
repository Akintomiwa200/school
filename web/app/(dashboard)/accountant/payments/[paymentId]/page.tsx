import { AccountantPaymentDetail } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ paymentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { paymentId } = await params;
  return <AccountantPaymentDetail paymentId={paymentId} />;
}
