import { LibraryIssueDetail } from "@/components/dashboard/librarian";

type PageProps = { params: Promise<{ issueId: string }> };

const BASE = "/librarian";

export default async function Page({ params }: PageProps) {
  const { issueId } = await params;
  return <LibraryIssueDetail basePath={BASE} issueId={issueId} />;
}
