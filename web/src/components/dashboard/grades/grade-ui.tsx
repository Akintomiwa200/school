import Link from "next/link";
import { cn } from "@/lib/utils";

export function GradesPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[20px] bg-card p-4 text-card-foreground shadow-float sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

export function gradesHref(segment?: string) {
  const base = "/student/grades";
  return segment ? `${base}/${segment}` : base;
}

export function parentGradesHref(segment?: string) {
  const base = "/parent/grades";
  return segment ? `${base}/${segment}` : base;
}

export function GradesSubNav({
  activeSegment,
  basePath = "/student/grades",
}: {
  activeSegment: string;
  basePath?: string;
}) {
  const href = (segment?: string) => (segment ? `${basePath}/${segment}` : basePath);

  const items = [
    { id: "overview", label: "Overview", href: href() },
    { id: "courses", label: "Courses", href: href("courses") },
    { id: "report-cards", label: "Report cards", href: href("report-cards") },
    { id: "transcript", label: "Transcript", href: href("transcript") },
  ] as const;

  return (
    <nav aria-label="Grades sections" className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full gap-2 sm:w-auto sm:min-w-0 sm:flex-wrap">
      {items.map((item) => {
        const isActive = item.id === activeSegment;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-purple text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> : null}
            {item.label}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}

export function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
}

export function formatGpa(value: number) {
  return value.toFixed(2);
}

export function formatDisplayDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export const LETTER_GRADE_STYLES: Record<string, string> = {
  "A+": "bg-green/15 text-green",
  A: "bg-green/15 text-green",
  "A-": "bg-green/10 text-green",
  "B+": "bg-brand-blue/15 text-brand-blue",
  B: "bg-brand-blue/15 text-brand-blue",
  "B-": "bg-brand-blue/10 text-brand-blue",
  "C+": "bg-brand-orange/15 text-brand-orange",
  C: "bg-brand-orange/15 text-brand-orange",
  "C-": "bg-brand-orange/10 text-brand-orange",
  D: "bg-destructive/15 text-destructive",
  F: "bg-destructive/15 text-destructive",
};

export function getLetterGradeStyle(letter: string | null | undefined) {
  if (!letter) return "bg-muted text-muted-foreground";
  return LETTER_GRADE_STYLES[letter] ?? "bg-muted text-muted-foreground";
}
