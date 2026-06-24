"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradesPanel, GradesSubNav } from "./grade-ui";
import { CURRENT_TERM_LABEL } from "./student-grades-data";

type StudentGradesShellProps = {
  children: React.ReactNode;
  showActions?: boolean;
  standalone?: boolean;
  basePath?: string;
};

const DEFAULT_STUDENT = {
  name: "Alex Johnson",
  studentId: "STU-2024-118",
};

export function StudentGradesShell({
  children,
  showActions = true,
  standalone = false,
  basePath = "/student/grades",
}: StudentGradesShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const studentName = session?.user?.name ?? DEFAULT_STUDENT.name;

  const activeSegment = (() => {
    if (pathname === basePath) return "overview";
    if (pathname.startsWith(`${basePath}/courses`)) return "courses";
    if (pathname.startsWith(`${basePath}/report-cards`)) return "report-cards";
    if (pathname.startsWith(`${basePath}/transcript`)) return "transcript";
    return "overview";
  })();

  const isStandalonePage =
    standalone ||
    pathname.includes("/assessments/") ||
    pathname.match(/\/courses\/[^/]+$/) !== null ||
    pathname.match(/\/report-cards\/[^/]+$/) !== null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {pathname.includes("/assessments/")
              ? "Assessment detail"
              : pathname.includes("/report-cards/") && pathname !== `${basePath}/report-cards`
                ? "Report card"
                : pathname.includes("/courses/") && pathname !== `${basePath}/courses`
                  ? "Course grades"
                  : pathname.endsWith("/transcript")
                    ? "Transcript"
                    : "Grades"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pathname.includes("/assessments/")
              ? "Score breakdown, feedback, and teacher comments."
              : pathname.includes("/report-cards/") && pathname !== `${basePath}/report-cards`
                ? "Official term report with attendance and comments."
                : pathname.includes("/courses/") && pathname !== `${basePath}/courses`
                  ? "Assessments and running grade for this course."
                  : pathname.endsWith("/transcript")
                    ? "Cumulative academic record across all terms."
                    : "Your scores, report cards, and academic progress."}
          </p>
        </div>
        {showActions && !isStandalonePage ? (
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="h-9 shrink-0 rounded-full px-4"
            >
              <Link href={`${basePath}/report-cards`}>
                <FileText className="mr-2 h-4 w-4" />
                Report cards
              </Link>
            </Button>
            <Button
              asChild
              className="h-9 shrink-0 rounded-full bg-brand-purple px-4 text-sm font-semibold text-white hover:bg-brand-purple/90"
            >
              <Link href={`${basePath}/transcript`}>
                <Download className="mr-2 h-4 w-4" />
                Transcript
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {!isStandalonePage ? (
        <GradesPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Student
            </p>
            <h2 className="mt-1 text-lg font-bold">{studentName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">ID: {DEFAULT_STUDENT.studentId}</p>
          </div>
          <p className="text-sm text-muted-foreground">{CURRENT_TERM_LABEL} · Academic record</p>
        </GradesPanel>
      ) : null}

      {!isStandalonePage ? (
        <GradesSubNav activeSegment={activeSegment} basePath={basePath} />
      ) : null}

      {children}
    </div>
  );
}
