"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Download, Eye, Layers, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useSubjectsList } from "@/hooks/use-dashboard-data";
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
  ADMIN_SUBJECTS,
  STAFF_DEPARTMENTS,
  SUBJECT_STATUS_STYLES,
  type SubjectRecord,
} from "./admin-entities-data";

type SubjectListItem = SubjectRecord & { teacherCount?: number };

function SubjectsSkeleton() {
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

export function AdminSubjects() {
  const { data: subjects = ADMIN_SUBJECTS, isFetching } = useSubjectsList(ADMIN_SUBJECTS);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubjectRecord["status"]>("all");
  const [departmentFilter, setDepartmentFilter] = useState<"all" | string>("all");
  const [page, setPage] = useState(1);

  const stats = useMemo(
    () => ({
      total: subjects.length,
      active: subjects.filter((s) => s.status === "active").length,
      departments: new Set(subjects.map((s) => s.department)).size,
      teachers: subjects.reduce(
        (sum, s) => sum + ((s as SubjectListItem).teacherCount ?? s.assignedTeacherIds.length),
        0,
      ),
    }),
    [subjects],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((subject) => {
      if (statusFilter !== "all" && subject.status !== statusFilter) return false;
      if (departmentFilter !== "all" && subject.department !== departmentFilter) return false;
      if (!q) return true;
      return (
        subject.name.toLowerCase().includes(q) ||
        subject.code.toLowerCase().includes(q) ||
        subject.department.toLowerCase().includes(q) ||
        subject.description.toLowerCase().includes(q)
      );
    });
  }, [subjects, query, statusFilter, departmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

  if (loading) return <SubjectsSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Subjects"
        description="Curriculum catalog with codes, credits, grade levels, and teacher assignments."
        action={
          <Button asChild className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <Link href="/admin/subjects/new">
              <Plus className="mr-2 h-4 w-4" />
              Add subject
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementStatCard label="Total subjects" value={String(stats.total)} icon={BookOpen} tone="purple" />
        <ManagementStatCard label="Active" value={String(stats.active)} icon={Layers} tone="green" />
        <ManagementStatCard label="Departments" value={String(stats.departments)} icon={BookOpen} tone="blue" />
        <ManagementStatCard label="Teacher assignments" value={String(stats.teachers)} icon={Users} tone="orange" />
      </div>

      <ManagementPanel className="space-y-4 border border-border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-bold">{filtered.length} subjects</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearchBar value={query} onChange={setQuery} placeholder="Search subjects" className="sm:w-56" />
            <AdminFilterSelect
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                { id: "all", label: "All status" },
                { id: "active", label: "Active" },
                { id: "archived", label: "Archived" },
              ]}
            />
            <AdminFilterSelect
              label="Department"
              value={departmentFilter}
              onChange={(value) => {
                setDepartmentFilter(value);
                setPage(1);
              }}
              options={[
                { id: "all", label: "All departments" },
                ...STAFF_DEPARTMENTS.map((dept) => ({ id: dept, label: dept })),
              ]}
              className="min-w-[180px]"
            />
            <Button variant="outline" className="h-9 shrink-0 rounded-full px-4">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </ManagementPanel>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Credits</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Grades</th>
              <th className="px-4 py-3 font-medium">Teachers</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((subject) => {
              const teacherCount =
                (subject as SubjectListItem).teacherCount ?? subject.assignedTeacherIds.length;
              return (
                <tr key={subject.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{subject.code}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/subjects/${subject.id}`} className="font-semibold hover:text-primary">
                      {subject.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subject.description}</p>
                  </td>
                  <td className="px-4 py-3">{subject.credits}</td>
                  <td className="px-4 py-3 text-muted-foreground">{subject.department}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {subject.gradeLevels.length > 0 ? subject.gradeLevels.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">{teacherCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                        SUBJECT_STATUS_STYLES[subject.status],
                      )}
                    >
                      {subject.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2">
                      <Link href={`/admin/subjects/${subject.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 0 ? (
          <AdminTablePagination
            page={page}
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
