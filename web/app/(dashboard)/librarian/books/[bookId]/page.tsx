import { LibraryBookDetail } from "@/components/dashboard/librarian";

type PageProps = { params: Promise<{ bookId: string }> };

const BASE = "/librarian";

export default async function Page({ params }: PageProps) {
  const { bookId } = await params;
  return <LibraryBookDetail basePath={BASE} bookId={bookId} />;
}
