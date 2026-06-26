"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  GraduationCap,
  MoreHorizontal,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useStudentsList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import { AVATAR_TONES } from "./admin-data";
import {
  ADMIN_PAGE_SIZE,
  AdminFilterPills,
  AdminSearchBar,
  AdminTablePagination,
} from "./admin-list-ui";
import {
  ADMIN_STUDENT_GRADES,
  ADMIN_STUDENTS,
  STATUS_STYLES,
  type StudentRecord,
} from "./admin-entities-data";

function StudentsSkeleton() {
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatEnrolledDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AttendanceBar({ value }: { value: number }) {
  const tone =
    value >= 95 ? "bg-green" : value >= 85 ? "bg-brand-blue" : value >= 75 ? "bg-brand-orange" : "bg-destructive";

  return (
    <div className="flex w-[100px] shrink-0 items-center gap-2">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">{value}%</span>
    </div>
  );
}

function GradeBreakdown({ students }: { students: StudentRecord[] }) {
  const breakdown = useMemo(() => {
    return ADMIN_STUDENT_GRADES.map((grade) => {
      const count = students.filter((s) => s.grade === grade && s.status === "active").length;
      const max = Math.max(
        ...ADMIN_STUDENT_GRADES.map((g) => students.filter((s) => s.grade === g && s.status === "active").length),
        1,
      );
      return { grade, count, width: (count / max) * 100 };
    });
  }, [students]);

  return (
    <ManagementPanel className="border border-border">
      <h2 className="text-base font-bold text-foreground">Students by grade</h2>
      <p className="mt-1 text-xs text-muted-foreground">Active enrollments only</p>
      <ul className="mt-4 space-y-3">
        {breakdown.map((item) => (
          <li key={item.grade}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Grade {item.grade}</span>
              <span className="text-xs font-semibold text-muted-foreground">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80 transition-all"
                style={{ width: `${item.width}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ManagementPanel>
  );
}

function RecentEnrollments({ students }: { students: StudentRecord[] }) {
  const recent = useMemo(
    () =>
      [...students]
        .sort((a, b) => b.enrolledDate.localeCompare(a.enrolledDate))
        .slice(0, 4),
    [students],
  );

  return (
    <ManagementPanel className="border border-border">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Recent enrollments</h2>
        <Link href="/admin/admissions" className="text-xs font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {recent.map((student) => (
          <li key={student.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                AVATAR_TONES[student.avatarTone],
              )}
            >
              {getInitials(student.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{student.name}</p>
              <p className="text-xs text-muted-foreground">
                Grade {student.grade} · {formatEnrolledDate(student.enrolledDate)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ManagementPanel>
  );
}

export function AdminStudents() {
  const searchParams = useSearchParams();
  const { data: students = ADMIN_STUDENTS, isFetching } = useStudentsList(ADMIN_STUDENTS);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "graduated">("all");
  const [gradeFilter, setGradeFilter] = useState<"all" | (typeof ADMIN_STUDENT_GRADES)[number]>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const classParam = searchParams.get("class");
    if (classParam) {
      const [grade, section] = classParam.split("-");
      if (grade) setGradeFilter(grade as (typeof ADMIN_STUDENT_GRADES)[number]);
      setClassFilter(classParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, gradeFilter, classFilter]);

  const stats = useMemo(() => {
    const active = students.filter((s) => s.status === "active").length;
    const newThisTerm = students.filter((s) => s.enrolledDate >= "2025-01-01").length;
    const graduated = students.filter((s) => s.status === "graduated").length;
    return { total: students.length, active, newThisTerm, graduated };
  }, [students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (gradeFilter !== "all" && s.grade !== gradeFilter) return false;
      if (classFilter !== "all" && s.className !== classFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.guardian.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [students, query, statusFilter, gradeFilter, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filtered, currentPage]);

  if (loading) return <StudentsSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Students"
        description="Enroll, update, and manage student records across all grades."
        action={
          <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/students/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Enroll student
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementStatCard label="Total students" value={String(stats.total)} tone="purple" icon={Users} />
        <ManagementStatCard label="Active" value={String(stats.active)} hint="Currently enrolled" tone="green" icon={UserCheck} />
        <ManagementStatCard
          label="New this term"
          value={String(stats.newThisTerm)}
          hint="Since Jan 2025"
          tone="blue"
          icon={UserPlus}
        />
        <ManagementStatCard label="Graduated" value={String(stats.graduated)} tone="orange" icon={GraduationCap} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <div className="space-y-5 xl:col-span-8">
          <ManagementPanel className="border border-border">
            <div className="space-y-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Student directory</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{filtered.length} students</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                <AdminSearchBar value={query} onChange={setQuery} placeholder="Search name, ID, class…" />
                <div className="relative w-full shrink-0 sm:w-[148px]">
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value as typeof gradeFilter)}
                    className="h-9 w-full appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">All grades</option>
                    {ADMIN_STUDENT_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full shrink-0 whitespace-nowrap rounded-xl px-4 sm:w-auto"
                >
                  <Download className="mr-1.5 h-4 w-4 shrink-0" />
                  Export
                </Button>
              </div>

              <AdminFilterPills
                options={[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "inactive", label: "Inactive" },
                  { id: "graduated", label: "Graduated" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Guardian</th>
                    <th className="px-4 py-3 font-medium">Attendance</th>
                    <th className="px-4 py-3 font-medium">Enrolled</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        No students match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((student) => (
                    <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                              AVATAR_TONES[student.avatarTone],
                            )}
                          >
                            {getInitials(student.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{student.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{student.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">Grade {student.grade}</p>
                        <p className="text-xs text-muted-foreground">{student.className}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-muted-foreground">{student.guardian}</p>
                        <p className="truncate text-xs text-muted-foreground/80">{student.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <AttendanceBar value={student.attendance} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatEnrolledDate(student.enrolledDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                            STATUS_STYLES[student.status],
                          )}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                          >
                            <Link href={`/admin/students/${student.id}`} aria-label={`View ${student.name}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <Link
                              href={`/admin/students/${student.id}`}
                              aria-label={`More actions for ${student.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
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

        <div className="space-y-5 xl:col-span-4">
          <GradeBreakdown students={students} />
          <RecentEnrollments students={students} />
          <ManagementPanel className="border border-border bg-gradient-to-br from-brand-purple/8 via-primary/5 to-brand-blue/8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Quick link</p>
            <p className="mt-2 text-base font-bold text-foreground">Review pending admissions</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Approve new applicants and move them into the student roster.
            </p>
            <Button asChild size="sm" className="mt-4 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/admin/admissions">Go to admissions</Link>
            </Button>
          </ManagementPanel>
        </div>
      </div>
    </div>
  );
}
