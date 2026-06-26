"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Download,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import {
  ADMIN_BEST_PERFORMERS,
  ADMIN_CLASS_ROUTINE_MONTHS,
  ADMIN_CLASS_ROUTINE_OPTIONS,
  ADMIN_COURSE_STATS,
  ADMIN_DASHBOARD_NOTIFICATIONS,
  ADMIN_EXAMS_SUMMARY,
  ADMIN_HERO_STATS,
  ADMIN_LIBRARY_RESOURCES,
  ADMIN_PERFORMER_DAYS,
  ADMIN_PROMO,
  ADMIN_STAR_STUDENTS,
  AVATAR_TONES,
  LIBRARY_TONES,
  NOTIFICATION_THUMBS,
} from "./admin-data";

function AdminDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 w-72 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-[20px] bg-muted" />
          ))}
        </div>
        <div className="space-y-5 xl:col-span-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[20px] bg-muted" />
          ))}
        </div>
        <div className="space-y-5 xl:col-span-3">
          <div className="h-56 rounded-[20px] bg-muted" />
          <div className="h-36 rounded-[20px] bg-muted" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {href ? (
        <Link href={href} className="text-xs font-semibold text-primary hover:underline">
          View All
        </Link>
      ) : null}
    </div>
  );
}

function RoutineSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !value && "text-muted-foreground",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-foreground">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  );
}

function HeroStatCard({
  label,
  value,
  tone,
  icon: Icon,
}: (typeof ADMIN_HERO_STATS)[number]) {
  const styles = {
    purple: {
      card: "border-brand-purple/15 bg-brand-purple/5",
      value: "text-brand-purple",
      icon: "bg-brand-purple/15 text-brand-purple",
    },
    blue: {
      card: "border-brand-blue/15 bg-brand-blue/5",
      value: "text-brand-blue",
      icon: "bg-brand-blue/15 text-brand-blue",
    },
    orange: {
      card: "border-brand-orange/15 bg-brand-orange/5",
      value: "text-brand-orange",
      icon: "bg-brand-orange/15 text-brand-orange",
    },
  }[tone];

  return (
    <ManagementPanel className={cn("flex items-center justify-between gap-4 border p-5", styles.card)}>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-3xl font-bold tracking-tight", styles.value)}>{value}</p>
      </div>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", styles.icon)}>
        <Icon className="h-5 w-5" />
      </span>
    </ManagementPanel>
  );
}

function AdminTotalExamsCard() {
  return (
    <ManagementPanel className="w-full border border-border bg-muted/60 p-6 shadow-none">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-bold text-foreground">Total Exams</p>
        <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
          {ADMIN_EXAMS_SUMMARY.trend}
        </span>
      </div>
      <p className="mt-4 text-5xl font-bold leading-none tabular-nums text-foreground">
        {ADMIN_EXAMS_SUMMARY.total}
      </p>
      <div className="mt-4 space-y-0.5 text-sm leading-relaxed text-muted-foreground">
        <p>Here is your total exams ratio in this month.</p>
        <p>
          Click here to{" "}
          <Link href="/admin/reports" className="font-semibold text-primary hover:underline">
            view details
          </Link>
          .
        </p>
      </div>
    </ManagementPanel>
  );
}

function AdminPromoCard() {
  return (
    <ManagementPanel className="overflow-hidden border-0 bg-gradient-to-br from-brand-purple via-brand-purple/90 to-primary p-0 text-primary-foreground shadow-float">
      <div className="relative flex min-h-[168px] flex-col justify-between p-5">
        <div className="absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/10 text-[10px] font-black tracking-widest text-primary-foreground/90 backdrop-blur-sm">
          API
        </div>
        <div className="pr-16">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/60">{ADMIN_PROMO.title}</p>
          <p className="mt-2 text-base font-bold leading-snug">{ADMIN_PROMO.subtitle}</p>
        </div>
        <Button
          asChild
          size="sm"
          className="mt-4 h-9 w-fit shrink-0 whitespace-nowrap rounded-full bg-primary-foreground/15 px-5 text-xs font-bold text-primary-foreground hover:bg-primary-foreground/25"
        >
          <Link href={ADMIN_PROMO.href}>
            {ADMIN_PROMO.cta}
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </ManagementPanel>
  );
}

function BestPerformersChart() {
  return (
    <div>
      <div className="space-y-4">
        {ADMIN_BEST_PERFORMERS.map((performer) => (
          <div key={performer.id} className="grid grid-cols-[64px_1fr] items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">{performer.classLabel}</span>
            <div className="relative h-11 overflow-hidden rounded-2xl bg-muted/50">
              <div className="absolute inset-0 grid grid-cols-5">
                {ADMIN_PERFORMER_DAYS.map((day) => (
                  <div key={day} className="border-l border-border/30 first:border-l-0" />
                ))}
              </div>
              <div
                className={cn(
                  "relative z-10 flex h-full items-center gap-2 bg-gradient-to-r px-2.5 text-white shadow-sm",
                  performer.gradient,
                )}
                style={{ width: `${performer.percent}%` }}
              >
                <div className="flex -space-x-1.5">
                  {performer.students.map((initials) => (
                    <span
                      key={initials}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-primary-foreground/70 bg-card/90 text-[8px] font-bold text-foreground"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-semibold">{performer.subject}</span>
                <span className="ml-auto text-[10px] font-bold">{performer.percent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[64px_1fr] gap-3">
        <span />
        <div className="grid grid-cols-5 text-center text-[10px] font-medium text-muted-foreground">
          {ADMIN_PERFORMER_DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const loading = usePageLoading(400);
  const [day, setDay] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(() => new Set());

  function toggleStarStudent(studentId: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }

  const allStarStudentsSelected =
    ADMIN_STAR_STUDENTS.length > 0 &&
    ADMIN_STAR_STUDENTS.every((student) => selectedStudentIds.has(student.id));
  const someStarStudentsSelected =
    selectedStudentIds.size > 0 && !allStarStudentsSelected;

  function toggleAllStarStudents() {
    setSelectedStudentIds((prev) => {
      if (ADMIN_STAR_STUDENTS.every((student) => prev.has(student.id))) {
        return new Set();
      }
      return new Set(ADMIN_STAR_STUDENTS.map((student) => student.id));
    });
  }

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Navigate the future of education with Schooli.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {ADMIN_HERO_STATS.map((stat) => (
          <HeroStatCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Explicit grid rows — left column spans 3 rows so middle/right don't stretch */}
      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        {/* ── Left column (spans all 3 rows) ── */}
        <div className="space-y-5 xl:col-span-4 xl:row-span-3 xl:row-start-1">
          <ManagementPanel className="border border-border">
            <SectionHeader title="Class Routine" href="/admin/classes" />
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <RoutineSelect
                placeholder="Select your day"
                value={day}
                options={ADMIN_CLASS_ROUTINE_OPTIONS.days}
                onChange={setDay}
              />
              <RoutineSelect
                placeholder="Select your class"
                value={className}
                options={ADMIN_CLASS_ROUTINE_OPTIONS.classes}
                onChange={setClassName}
              />
              <RoutineSelect
                placeholder="Section"
                value={section}
                options={ADMIN_CLASS_ROUTINE_OPTIONS.sections}
                onChange={setSection}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ADMIN_CLASS_ROUTINE_MONTHS.map((month) => (
                <div
                  key={month.id}
                  className={cn(
                    "rounded-2xl border p-4",
                    month.tone === "blue"
                      ? "border-brand-blue/25 bg-brand-blue/8"
                      : "border-brand-orange/25 bg-brand-orange/8",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-bold",
                      month.tone === "blue" ? "text-brand-blue" : "text-brand-orange",
                    )}
                  >
                    {month.label}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9 w-full justify-center gap-1.5 rounded-xl border-border/60 bg-card px-2 text-xs font-semibold"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Download PDF</span>
                  </Button>
                </div>
              ))}
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <SectionHeader title="Star Students" href="/admin/students" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-3 pr-2 font-medium">
                      <input
                        type="checkbox"
                        checked={allStarStudentsSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someStarStudentsSelected;
                        }}
                        onChange={toggleAllStarStudents}
                        aria-label="Select all star students"
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                    </th>
                    <th className="pb-3 pr-3 font-medium">Name</th>
                    <th className="pb-3 pr-3 font-medium">ID</th>
                    <th className="pb-3 pr-3 font-medium">Marks</th>
                    <th className="pb-3 font-medium">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_STAR_STUDENTS.map((student) => {
                    const selected = selectedStudentIds.has(student.id);
                    return (
                      <tr
                        key={student.id}
                        onClick={() => toggleStarStudent(student.id)}
                        className={cn(
                          "cursor-pointer border-b border-border last:border-0 transition-colors",
                          selected ? "bg-primary/8" : "hover:bg-muted/30",
                        )}
                      >
                        <td className="py-3 pr-2" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleStarStudent(student.id)}
                            aria-label={`Select ${student.name}`}
                            className="h-4 w-4 rounded border-border accent-primary"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                AVATAR_TONES[student.avatarTone],
                              )}
                            >
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                            <span className="font-semibold">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{student.studentId}</td>
                        <td className="py-3 pr-3 font-medium">{student.marks}</td>
                        <td className="py-3 font-bold text-primary">{student.percent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <SectionHeader title="Notifications" href="/admin/announcements" />
            <ul className="space-y-3">
              {ADMIN_DASHBOARD_NOTIFICATIONS.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "h-14 w-16 shrink-0 rounded-xl bg-gradient-to-br",
                      NOTIFICATION_THUMBS[item.tone],
                    )}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.time} · {item.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </ManagementPanel>
        </div>

        {/* Row 1 — Library + Course Statistics */}
        <ManagementPanel className="border border-border xl:col-span-5 xl:row-start-1">
          <SectionHeader title="Library" href="/admin/library" />
          <ul className="divide-y divide-border">
            {ADMIN_LIBRARY_RESOURCES.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      LIBRARY_TONES[resource.tone],
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{resource.subject}</p>
                    <p className="text-xs text-muted-foreground">{resource.files} files</p>
                  </div>
                </div>
                <Link
                  href={`/admin/library/books?category=${encodeURIComponent(resource.subject)}`}
                  className="shrink-0 whitespace-nowrap text-xs font-semibold text-primary hover:underline"
                >
                  Read now
                </Link>
              </li>
            ))}
          </ul>
        </ManagementPanel>

        <ManagementPanel className="border border-border xl:col-span-3 xl:row-start-1">
          <SectionHeader title="Course Statistics" href="/admin/subjects" />
          <div className="relative mx-auto h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ADMIN_COURSE_STATS.segments}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {ADMIN_COURSE_STATS.segments.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">
                {ADMIN_COURSE_STATS.total.toLocaleString()}
              </p>
            </div>
          </div>
          <ul className="mt-1 space-y-1.5">
            {ADMIN_COURSE_STATS.segments.map((segment) => (
              <li key={segment.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span className="text-muted-foreground">{segment.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </ManagementPanel>

        {/* Row 2 — Total Exams + Promo */}
        <div className="xl:col-span-5 xl:row-start-2">
          <AdminTotalExamsCard />
        </div>

        <div className="xl:col-span-3 xl:row-start-2">
          <AdminPromoCard />
        </div>

        {/* Row 3 — Best Performers (directly under row 2) */}
        <ManagementPanel className="border border-border xl:col-span-8 xl:col-start-5 xl:row-start-3">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground">Best Performers</h2>
            <div className="relative">
              <select className="h-8 appearance-none rounded-lg border border-border bg-background pl-3 pr-7 text-xs font-semibold outline-none">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <BestPerformersChart />
        </ManagementPanel>
      </div>
    </div>
  );
}
