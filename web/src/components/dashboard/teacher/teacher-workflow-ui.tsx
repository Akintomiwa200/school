import Link from "next/link";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPanel } from "../management/management-ui";

export function TeacherDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="h-32 rounded-[20px] bg-muted" />
      <div className="h-64 rounded-[20px] bg-muted" />
    </div>
  );
}

export function TeacherNotFound({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="space-y-6">
      <AdminBackLink href={backHref} label={backLabel} />
      <ManagementPanel className="border border-border">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Link href={backHref} className="mt-4 inline-block text-sm font-semibold text-brand-purple hover:underline">
          {backLabel}
        </Link>
      </ManagementPanel>
    </div>
  );
}
