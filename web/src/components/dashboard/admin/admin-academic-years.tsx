"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, CalendarCheck, CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAcademicYears, useUpdateAcademicYear } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  ADMIN_ACADEMIC_YEARS,
  STATUS_STYLES,
  type AcademicYearRecord,
} from "./admin-entities-data";

type AcademicYearListItem = AcademicYearRecord & { classCount?: number };

function AcademicYearsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 w-72 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-muted" />
        ))}
      </div>
    </div>
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const end = new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${start} → ${end}`;
}

export function AdminAcademicYears() {
  const { data: years = ADMIN_ACADEMIC_YEARS, isFetching } = useAcademicYears(ADMIN_ACADEMIC_YEARS);
  const loading = usePageLoading(400) || isFetching;

  const stats = useMemo(
    () => ({
      total: years.length,
      active: years.filter((y) => y.status === "active").length,
      upcoming: years.filter((y) => y.status === "upcoming").length,
    }),
    [years],
  );

  if (loading) return <AcademicYearsSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Academic years"
        description="Terms, sessions, and the active academic calendar."
        action={
          <Button asChild className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Link href="/admin/academic-years/new">
              <Plus className="mr-2 h-4 w-4" />
              New academic year
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ManagementStatCard label="Total years" value={String(stats.total)} icon={Calendar} tone="purple" />
        <ManagementStatCard label="Current year" value={String(stats.active)} icon={CalendarCheck} tone="green" />
        <ManagementStatCard label="Upcoming" value={String(stats.upcoming)} icon={CalendarClock} tone="blue" />
      </div>

      <div className="space-y-3">
        {(years as AcademicYearListItem[]).map((year) => (
          <AcademicYearCard key={year.id} year={year} />
        ))}
      </div>
    </div>
  );
}

function AcademicYearCard({ year }: { year: AcademicYearListItem }) {
  const updateYear = useUpdateAcademicYear(year.id);
  const activeTerm = year.terms.find((term) => term.status === "active");

  const setCurrent = async () => {
    await updateYear.mutateAsync({ action: "set_current" });
  };

  return (
    <ManagementPanel className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/academic-years/${year.id}`} className="text-base font-bold hover:text-primary">
            {year.name}
          </Link>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", STATUS_STYLES[year.status])}>
            {year.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{formatDateRange(year.startDate, year.endDate)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {year.terms.length} terms
          {activeTerm ? ` · Active term: ${activeTerm.name}` : ""}
          {typeof year.classCount === "number" ? ` · ${year.classCount} classes` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/admin/academic-years/${year.id}`}>Manage</Link>
        </Button>
        {year.status === "upcoming" ? (
          <Button
            variant="outline"
            className="rounded-full"
            disabled={updateYear.isPending}
            onClick={setCurrent}
          >
            Set as active
          </Button>
        ) : year.status === "active" ? (
          <Button variant="outline" className="rounded-full" disabled>
            Current year
          </Button>
        ) : null}
      </div>
    </ManagementPanel>
  );
}
