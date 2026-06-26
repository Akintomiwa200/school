import { Suspense } from "react";
import { StudentMessages } from "@/components/dashboard/messages";

function MessagesFallback() {
  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[560px] items-center justify-center rounded-[24px] border border-border bg-card">
      <p className="text-sm text-muted-foreground">Loading messages…</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <StudentMessages basePath="/admin/messages" />
    </Suspense>
  );
}
