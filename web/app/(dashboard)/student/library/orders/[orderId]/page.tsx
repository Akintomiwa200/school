import { StudentLibraryOrderDetail, StudentLibraryShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  return (
    <StudentLibraryShell standalone>
      <StudentLibraryOrderDetail orderId={orderId} />
    </StudentLibraryShell>
  );
}
