import { StudentLibraryReader, StudentLibraryShell } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ bookId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { bookId } = await params;
  return (
    <StudentLibraryShell standalone>
      <StudentLibraryReader bookId={bookId} />
    </StudentLibraryShell>
  );
}
