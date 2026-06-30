"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  GraduationCap,
  Info,
  Trophy,
  Zap,
} from "lucide-react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherDashboard } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import {
  TEACHER_AVATAR_TONES,
  TEACHER_DASHBOARD_CLASSES,
  TEACHER_MASTERY_TONES,
  buildTeacherDashboardFallback,
  getTeacherScoreBarTone,
  type TeacherPerformanceTier,
  type TeacherStudentProficiency,
} from "./teacher-data";

const SEGMENT_STYLES: Record<
  TeacherPerformanceTier,
  { card: string; value: string; badge: string; subtext: string }
> = {
  mastered: {
    card: "border-green/15 bg-green/5",
    value: "text-green",
    badge: "bg-green/15 text-green ring-green/20",
    subtext: "text-muted-foreground",
  },
  working: {
    card: "border-brand-blue/15 bg-brand-blue/5",
    value: "text-brand-blue",
    badge: "bg-brand-blue/15 text-brand-blue ring-brand-blue/20",
    subtext: "text-muted-foreground",
  },
  attention: {
    card: "border-brand-orange/15 bg-brand-orange/5",
    value: "text-brand-orange",
    badge: "bg-brand-orange/15 text-brand-orange ring-brand-orange/20",
    subtext: "text-muted-foreground",
  },
};

const ROW_TONES: Record<TeacherPerformanceTier, string> = {
  attention: "bg-brand-orange/[0.06]",
  working: "bg-brand-blue/[0.06]",
  mastered: "bg-green/[0.06]",
};

const TIER_LABELS: Record<TeacherPerformanceTier, string> = {
  mastered: "Mastered",
  working: "Working towards",
  attention: "Needs attention",
};

const TIER_BADGE: Record<TeacherPerformanceTier, string> = {
  mastered: "bg-green/15 text-green",
  working: "bg-brand-blue/15 text-brand-blue",
  attention: "bg-brand-orange/15 text-brand-orange",
};

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 w-full max-w-3xl rounded-xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-48 rounded-[20px] bg-muted lg:col-span-2" />
        <div className="h-48 rounded-[20px] bg-muted" />
        <div className="h-48 rounded-[20px] bg-muted" />
        <div className="h-48 rounded-[20px] bg-muted" />
      </div>
      <div className="h-80 rounded-[20px] bg-muted" />
    </div>
  );
}

function ClassSelect({
  value,
  onChange,
  classes,
}: {
  value: string;
  onChange: (value: string) => void;
  classes: { id: string; name: string }[];
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">Select class</span>
      <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 min-w-[132px] appearance-none rounded-xl border border-border bg-background py-2 pl-9 pr-8 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {classes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}

function RosterAvatars({
  preview,
  overflow,
}: {
  preview: { id: string; initials: string; name: string; tone: keyof typeof TEACHER_AVATAR_TONES }[];
  overflow: number;
}) {
  return (
    <div className="flex items-center pl-1">
      {preview.map((student, index) => (
        <span
          key={student.id}
          title={student.name}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background",
            TEACHER_AVATAR_TONES[student.tone],
            index > 0 && "-ml-2.5",
          )}
        >
          {student.initials}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

function PartialTrophy({ fillPercent }: { fillPercent: number }) {
  return (
    <div className="relative h-16 w-16">
      <Trophy className="absolute inset-0 h-16 w-16 text-muted/30" strokeWidth={1.5} />
      <div
        className="absolute inset-0 overflow-hidden text-green"
        style={{ clipPath: `inset(${100 - fillPercent}% 0 0 0)` }}
      >
        <Trophy className="h-16 w-16" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function WorkAssignedBubbles() {
  const bubbles = [
    { size: 30, tone: "bg-green/80", left: "8%", top: "38%" },
    { size: 18, tone: "bg-green/50", left: "34%", top: "52%" },
    { size: 36, tone: "bg-green/80", left: "48%", top: "18%" },
    { size: 14, tone: "bg-brand-blue/60", left: "22%", top: "18%" },
    { size: 22, tone: "bg-brand-orange/70", left: "62%", top: "48%" },
    { size: 16, tone: "bg-brand-purple/50", left: "72%", top: "24%" },
    { size: 12, tone: "bg-green/40", left: "78%", top: "58%" },
  ];

  return (
    <div className="relative h-16 w-24">
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className={cn("absolute rounded-full", bubble.tone)}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.left,
            top: bubble.top,
          }}
        />
      ))}
    </div>
  );
}

function MasteryBadge({
  value,
  tone,
  size,
}: {
  value: number;
  tone: keyof typeof TEACHER_MASTERY_TONES;
  size: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "h-12 w-12 text-base" : size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold tabular-nums",
        sizeClass,
        TEACHER_MASTERY_TONES[tone],
      )}
    >
      {value}
    </span>
  );
}

function getMasterySizes(student: TeacherStudentProficiency) {
  const values = {
    attention: student.needingAttention,
    working: student.workingTowards,
    mastered: student.mastered,
  };
  const max = Math.max(values.attention, values.working, values.mastered);

  const toSize = (value: number): "sm" | "md" | "lg" => {
    if (value === max && max > 0) return "lg";
    if (value >= max * 0.45) return "md";
    return "sm";
  };

  return {
    attention: toSize(values.attention),
    working: toSize(values.working),
    mastered: toSize(values.mastered),
  };
}

function ProficiencyRow({ student, view }: { student: TeacherStudentProficiency; view: "objectives" | "strands" }) {
  const sizes = getMasterySizes(student);

  if (view === "strands") {
    return (
      <tr className={cn("border-b border-border/60 last:border-0", ROW_TONES[student.rowTone])}>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-background", TEACHER_AVATAR_TONES[student.avatarTone])}>
              {student.initials}
            </span>
            <Link href={`/teacher/students/${student.id}`} className="font-semibold text-foreground hover:text-brand-purple">
              {student.name}
            </Link>
          </div>
        </td>
        <td className="px-5 py-4">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", TIER_BADGE[student.rowTone])}>
            {TIER_LABELS[student.rowTone]}
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="flex min-w-[140px] items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", getTeacherScoreBarTone(student.averageScore))} style={{ width: `${student.averageScore}%` }} />
            </div>
            <span className="min-w-[2.5rem] shrink-0 text-sm font-bold tabular-nums">{student.averageScore}%</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={cn("border-b border-border/60 last:border-0", ROW_TONES[student.rowTone])}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-background",
              TEACHER_AVATAR_TONES[student.avatarTone],
            )}
          >
            {student.initials}
          </span>
          <Link href={`/teacher/students/${student.id}`} className="font-semibold text-foreground hover:text-brand-purple">
            {student.name}
          </Link>
        </div>
      </td>
      <td className="px-5 py-4 text-sm font-medium tabular-nums text-muted-foreground">
        {student.workCompleted} / {student.workTotal}
      </td>
      <td className="px-5 py-4">
        <div className="flex min-w-[140px] items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", getTeacherScoreBarTone(student.averageScore))}
              style={{ width: `${student.averageScore}%` }}
            />
          </div>
          <span className="min-w-[2.5rem] shrink-0 text-sm font-bold tabular-nums">{student.averageScore}%</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <MasteryBadge value={student.needingAttention} tone="attention" size={sizes.attention} />
      </td>
      <td className="px-5 py-4">
        <MasteryBadge value={student.workingTowards} tone="working" size={sizes.working} />
      </td>
      <td className="px-5 py-4">
        <MasteryBadge value={student.mastered} tone="mastered" size={sizes.mastered} />
      </td>
    </tr>
  );
}

export function TeacherDashboard() {
  const pageLoading = usePageLoading(400);
  const defaultClassId = TEACHER_DASHBOARD_CLASSES[0]?.id ?? "class-a";
  const [selectedClass, setSelectedClass] = useState(defaultClassId);
  const [proficiencyView, setProficiencyView] = useState<"objectives" | "strands">("objectives");
  const fallback = buildTeacherDashboardFallback(selectedClass);
  const { data: dashboard = fallback, isFetching } = useTeacherDashboard(selectedClass, fallback);

  if (pageLoading && isFetching) return <DashboardSkeleton />;

  const classOptions = dashboard.classes.length > 0 ? dashboard.classes : fallback.classes;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{dashboard.className}</p>
          </div>
          <ClassSelect
            value={selectedClass}
            onChange={setSelectedClass}
            classes={classOptions.map((item) => ({ id: item.id, name: item.name }))}
          />
          <RosterAvatars preview={dashboard.rosterPreview} overflow={dashboard.rosterOverflow} />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/teacher/notifications"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-float transition-colors hover:bg-muted/40"
          >
            <Zap className="h-4 w-4 text-brand-orange" />
            <span>Alerts</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-bold text-muted-foreground">
              {dashboard.alerts.total}
            </span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[11px] font-bold text-destructive">
              {dashboard.alerts.urgent}
            </span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ManagementPanel className="grid min-h-[188px] grid-cols-1 overflow-hidden border border-border p-0 sm:grid-cols-2 lg:col-span-2">
          <div className="flex flex-col justify-between p-5 sm:border-r sm:border-border/60">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Overall class score
              </p>
              <p className="mt-2 text-3xl font-bold leading-none tracking-tight text-brand-purple sm:text-4xl">
                {dashboard.summary.overallScore}%
              </p>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Grade average {dashboard.summary.overallGradeAvg}%
              </p>
              <PartialTrophy fillPercent={dashboard.summary.overallScore} />
            </div>
          </div>

          <div className="flex flex-col justify-between border-t border-border/60 p-5 sm:border-t-0">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Work assigned
              </p>
              <p className="mt-2 text-3xl font-bold leading-none tracking-tight text-brand-blue sm:text-4xl">
                {dashboard.summary.workAssigned}
              </p>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Grade average {dashboard.summary.workGradeAvg}%
              </p>
              <WorkAssignedBubbles />
            </div>
          </div>
        </ManagementPanel>

        {dashboard.segments.map((segment) => {
          const styles = SEGMENT_STYLES[segment.tier];
          return (
            <ManagementPanel
              key={segment.tier}
              className={cn(
                "relative flex min-h-[188px] flex-col justify-between border",
                styles.card,
              )}
            >
              <span
                className={cn(
                  "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold ring-2",
                  styles.badge,
                )}
              >
                {segment.initials}
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {TIER_LABELS[segment.tier]}
              </p>
              <div>
                <p className={cn("text-3xl font-bold leading-none sm:text-4xl", styles.value)}>
                  {segment.count}
                </p>
                <p className={cn("mt-2 text-xs font-medium", styles.subtext)}>
                  {segment.classPercent}% of class
                </p>
                <p className={cn("mt-1 text-xs font-semibold", styles.subtext)}>
                  Grade avg: {segment.gradeAvg}%
                </p>
              </div>
            </ManagementPanel>
          );
        })}
      </div>

      <ManagementPanel className="overflow-hidden border border-border p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold text-foreground">Students proficiency</h2>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setProficiencyView("objectives")}
              className={cn(
                "inline-flex items-center gap-1.5 transition-colors",
                proficiencyView === "objectives"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Learning objectives
              <Info className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setProficiencyView("strands")}
              className={cn(
                "transition-colors",
                proficiencyView === "strands"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All strands
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Full name</th>
                {proficiencyView === "objectives" ? (
                  <>
                    <th className="px-5 py-3">Work completed</th>
                    <th className="px-5 py-3">Average score</th>
                    <th className="px-5 py-3">Needing attention</th>
                    <th className="px-5 py-3">Working towards</th>
                    <th className="px-5 py-3">Mastered</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-3">Strand tier</th>
                    <th className="px-5 py-3">Average score</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {dashboard.proficiency.map((student) => (
                <ProficiencyRow key={student.id} student={student} view={proficiencyView} />
              ))}
            </tbody>
          </table>
        </div>
      </ManagementPanel>
    </div>
  );
}
