import { StudentLibraryReceipt, StudentLibraryShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  return (
    <StudentLibraryShell standalone>
      <StudentLibraryReceipt orderId={orderId} />
    </StudentLibraryShell>
  );
}
