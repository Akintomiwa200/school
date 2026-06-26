"use client";

import { usePageLoading } from "@/hooks/use-page-loading";
import { getDashboardPageMeta } from "../page-meta";
import {
  ManagementPageHeader,
  ManagementPanel,
  ManagementPlaceholder,
  ManagementStatCard,
} from "../management/management-ui";

type ManagementSectionPageProps = {
  path: string;
  children?: React.ReactNode;
};

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-56 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-[20px] bg-muted" />
    </div>
  );
}

export function ManagementSectionPage({ path, children }: ManagementSectionPageProps) {
  const loading = usePageLoading(300);
  const meta = getDashboardPageMeta(path);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader title={meta.title} description={meta.description} />

      {meta.stats && meta.stats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meta.stats.map((stat, index) => (
            <ManagementStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              tone={(["purple", "blue", "green", "orange"] as const)[index % 4]}
            />
          ))}
        </div>
      ) : null}

      {children ? (
        children
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {(meta.sections ?? []).map((section) => (
            <ManagementPanel key={section.title} className="border border-border">
              <h2 className="text-base font-bold text-foreground">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
              <div className="mt-4">
                <ManagementPlaceholder />
              </div>
            </ManagementPanel>
          ))}
        </div>
      )}
    </div>
  );
}
