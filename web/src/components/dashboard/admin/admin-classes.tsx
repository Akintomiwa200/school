"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  LayoutGrid,
  Plus,
  School,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useClassesList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  ADMIN_PAGE_SIZE,
  AdminFilterSelect,
  AdminSearchBar,
  AdminTablePagination,
} from "./admin-list-ui";
import {
  ADMIN_CLASSES,
  ADMIN_STUDENT_GRADES,
  type ClassRecord,
} from "./admin-entities-data";

function ClassesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 w-72 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-[20px] bg-muted" />
    </div>
  );
}

function CapacityBar({ students, capacity }: { students: number; capacity: number }) {
  const percent = Math.round((students / capacity) * 100);
  const tone =
    percent >= 95 ? "bg-destructive" : percent >= 85 ? "bg-brand-orange" : percent >= 70 ? "bg-brand-blue" : "bg-green";

  return (
    <div className="flex w-[120px] shrink-0 items-center gap-2">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${percent}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">{percent}%</span>
    </div>
  );
}

export function AdminClasses() {
  const searchParams = useSearchParams();
  const { data: classes = ADMIN_CLASSES, isFetching } = useClassesList(ADMIN_CLASSES);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<"all" | (typeof ADMIN_STUDENT_GRADES)[number]>("all");
  const [sectionFilter, setSectionFilter] = useState<"all" | "A" | "B" | "C" | "D" | "E">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const gradeParam = searchParams.get("grade");
    if (gradeParam && ADMIN_STUDENT_GRADES.includes(gradeParam as (typeof ADMIN_STUDENT_GRADES)[number])) {
      setGradeFilter(gradeParam as (typeof ADMIN_STUDENT_GRADES)[number]);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, gradeFilter, sectionFilter]);

  const stats = useMemo(() => {
    const totalEnrolled = classes.reduce((sum, c) => sum + c.students, 0);
    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    const avgFill = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    const grades = new Set(classes.map((c) => c.grade)).size;
    return { total: classes.length, totalEnrolled, avgFill, grades };
  }, [classes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return classes.filter((c) => {
      if (gradeFilter !== "all" && c.grade !== gradeFilter) return false;
      if (sectionFilter !== "all" && c.section !== sectionFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.grade.includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.homeroomTeacher.toLowerCase().includes(q)
      );
    });
  }, [classes, query, gradeFilter, sectionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filtered, currentPage]);

  if (loading) return <ClassesSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Classes"
        description="Grade levels, sections, homeroom teachers, and class capacity."
        action={
          <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/classes/new">
              <Plus className="mr-2 h-4 w-4" />
              New class
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementStatCard label="Total classes" value={String(stats.total)} tone="purple" icon={LayoutGrid} />
        <ManagementStatCard
          label="Enrolled students"
          value={stats.totalEnrolled.toLocaleString()}
          hint="Across all sections"
          tone="blue"
          icon={Users}
        />
        <ManagementStatCard
          label="Avg. capacity"
          value={`${stats.avgFill}%`}
          hint="Seats filled"
          tone="orange"
          icon={School}
        />
        <ManagementStatCard label="Grade levels" value={String(stats.grades)} tone="green" icon={School} />
      </div>

      <ManagementPanel className="border border-border">
        <div className="space-y-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Class directory</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{filtered.length} classes</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearchBar value={query} onChange={setQuery} placeholder="Search class, teacher…" className="sm:min-w-[200px] sm:flex-1" />
            <AdminFilterSelect
              label="Grade"
              value={gradeFilter}
              onChange={setGradeFilter}
              options={[
                { id: "all", label: "All grades" },
                ...ADMIN_STUDENT_GRADES.map((grade) => ({ id: grade, label: `Grade ${grade}` })),
              ]}
            />
            <AdminFilterSelect
              label="Section"
              value={sectionFilter}
              onChange={setSectionFilter}
              options={[
                { id: "all", label: "All sections" },
                ...(["A", "B", "C", "D", "E"] as const).map((section) => ({
                  id: section,
                  label: `Section ${section}`,
                })),
              ]}
            />
            <Button variant="outline" className="h-9 shrink-0 rounded-full px-4">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </ManagementPanel>

      <ManagementPanel className="border border-border p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Homeroom teacher</th>
                <th className="px-4 py-3 font-medium">Enrolled</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Fill rate</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No classes match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((classItem) => (
                  <ClassRow key={classItem.id} classItem={classItem} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 ? (
          <AdminTablePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null}
      </ManagementPanel>
    </div>
  );
}

function ClassRow({ classItem }: { classItem: ClassRecord }) {
  const nearlyFull = classItem.students / classItem.capacity >= 0.9;

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20">
      <td className="px-4 py-3">
        <p className="font-semibold">{classItem.name}</p>
        <p className="text-xs text-muted-foreground">
          Grade {classItem.grade} · Section {classItem.section}
        </p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{classItem.homeroomTeacher}</td>
      <td className="px-4 py-3 font-medium tabular-nums">{classItem.students}</td>
      <td className="px-4 py-3 tabular-nums text-muted-foreground">{classItem.capacity}</td>
      <td className="px-4 py-3">
        <CapacityBar students={classItem.students} capacity={classItem.capacity} />
      </td>
      <td className="px-4 py-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 shrink-0 whitespace-nowrap rounded-xl px-3 text-xs font-semibold"
        >
          <Link href={`/admin/classes/${classItem.id}`}>
            {nearlyFull ? "View roster" : "Manage roster"}
          </Link>
        </Button>
      </td>
    </tr>
  );
}
