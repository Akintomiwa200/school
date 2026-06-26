import { LibraryBookForm } from "@/components/dashboard/librarian";

const BASE = "/admin/library";

export default function Page() {
  return <LibraryBookForm basePath={BASE} />;
}
