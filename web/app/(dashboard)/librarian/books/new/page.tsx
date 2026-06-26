import { LibraryBookForm } from "@/components/dashboard/librarian";

const BASE = "/librarian";

export default function Page() {
  return <LibraryBookForm basePath={BASE} />;
}
