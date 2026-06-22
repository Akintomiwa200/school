import { getDashboardPageMeta } from "./page-meta";

type DashboardPageProps = {
  path: string;
};

export function DashboardPage({ path }: DashboardPageProps) {
  const meta = getDashboardPageMeta(path);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {meta.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{meta.description}</p>
      </div>

      {meta.stats && meta.stats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meta.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-purple">{stat.value}</p>
              {stat.hint ? <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {(meta.sections ?? []).map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {section.description}
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
              Data tables and actions will connect to the API here.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
