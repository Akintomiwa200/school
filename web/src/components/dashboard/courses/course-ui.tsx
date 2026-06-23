import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CourseIllustration, StudentCourseListItem } from "./student-course-data";

export function CoursesPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-card p-4 text-card-foreground shadow-float sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CourseIllustration({
  illustration,
  className,
}: {
  illustration: CourseIllustration;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
        illustration.bg,
        className,
      )}
    >
      <span
        className={cn(
          "absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-40",
          illustration.accent,
        )}
      />
      <span
        className={cn(
          "absolute -bottom-5 -left-4 h-20 w-20 rounded-3xl opacity-30",
          illustration.accent,
        )}
      />
      <span className="relative text-[42px] leading-none drop-shadow-sm" role="img" aria-hidden>
        {illustration.emoji}
      </span>
    </div>
  );
}

export function CourseRating({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-card-foreground">
      <Star size={14} className="fill-brand-yellow text-brand-yellow" />
      {rating.toFixed(1)}
    </div>
  );
}

export function CourseDotTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange?: (tab: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const className = cn(
          "flex items-center gap-2 text-sm font-medium transition-colors",
          isActive ? "text-brand-orange" : "text-muted-foreground hover:text-foreground",
        );

        if (onChange) {
          return (
            <button key={tab.id} type="button" onClick={() => onChange(tab.id)} className={className}>
              {isActive ? (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden />
              ) : null}
              {tab.label}
            </button>
          );
        }

        return (
          <span key={tab.id} className={className}>
            {isActive ? (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden />
            ) : null}
            {tab.label}
          </span>
        );
      })}
    </div>
  );
}

export function CourseBackLink({ href = "/student/courses", label = "Back to courses" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function CourseStatusBadge({ status }: { status: StudentCourseListItem["status"] }) {
  const labels = {
    active: "In progress",
    upcoming: "Upcoming",
    completed: "Completed",
  } as const;

  const styles = {
    active: "bg-brand-blue/15 text-brand-blue",
    upcoming: "bg-brand-orange/15 text-brand-orange",
    completed: "bg-green/15 text-green",
  } as const;

  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", styles[status])}>
      {labels[status]}
    </span>
  );
}

export function CoursePrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      size="sm"
      className={cn(
        "h-9 rounded-full bg-brand-orange px-5 text-xs font-semibold text-ink hover:bg-brand-orange/90",
        className,
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
