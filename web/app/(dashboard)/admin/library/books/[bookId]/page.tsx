import { AdminLibraryBookDetail } from "@/components/dashboard/admin/admin-library-book-detail";

type PageProps = { params: Promise<{ bookId: string }> };

export default async function Page({ params }: PageProps) {
  const { bookId } = await params;
  return <AdminLibraryBookDetail bookId={bookId} />;
}
