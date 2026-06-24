import { StudentLibraryShell, StudentLibraryShopItem } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ itemId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { itemId } = await params;
  return (
    <StudentLibraryShell standalone>
      <StudentLibraryShopItem itemId={itemId} />
    </StudentLibraryShell>
  );
}
