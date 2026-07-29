"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useCreateTeacherAssignment, useTeacherAssignments, useTeacherCourses } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { TeacherPageHeader, teacherInitialLoading } from "./teacher-workflow-ui";

type AssignmentItem = {
  id: string;
  title: string;
  className: string;
  classId: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: string;
};

const COURSES_EMPTY = {
  classes: [] as { id: string; name: string }[],
  courses: [] as never[]
};

function AssignmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-12 w-full max-w-sm animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-[20px] bg-muted" />
    </div>
  );
}

function AssignmentModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <ManagementPanel className="w-full max-w-md border border-border shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </ManagementPanel>
    </div>
  );
}

export function TeacherAssignments() {
  const { data: coursesData = COURSES_EMPTY, isFetching: coursesFetching } = useTeacherCourses(COURSES_EMPTY);
  const { data: assignments = [], isFetching, isFetched } = useTeacherAssignments<AssignmentItem[]>([]);
  const createAssignment = useCreateTeacherAssignment();
  const pageLoading = usePageLoading();

  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newClassId, setNewClassId] = useState(coursesData.classes[0]?.id ?? "");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [maxScore, setMaxScore] = useState("100");

  const loading = teacherInitialLoading(pageLoading, isFetching || coursesFetching, isFetched);

  // Filter by class if selected
  const classFiltered = useMemo(() => {
    if (!classId) return assignments;
    return assignments.filter((a) => a.classId === classId);
  }, [assignments, classId]);

  // Filter by status if selected
  const statusFiltered = useMemo(() => {
    if (!statusFilter) return classFiltered;
    return classFiltered.filter((a) => a.status === statusFilter);
  }, [classFiltered, statusFilter]);

  // Filter by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return statusFiltered;
    const q = search.toLowerCase();
    return statusFiltered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.className.toLowerCase().includes(q)
    );
  }, [statusFiltered, search]);

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => a.status === "active").length;
  const gradingAssignments = assignments.filter((a) => a.status === "grading").length;
  const closedAssignments = assignments.filter((a) => a.status === "closed").length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.submitted, 0);
  const totalPossible = assignments.reduce((sum, a) => sum + a.total, 0);
  const submissionRate = totalPossible > 0
    ? Math.round((totalSubmissions / totalPossible) * 100)
    : 0;
  const overdueCount = assignments.filter((a) => {
    if (a.status === "closed") return false;
    return new Date(a.dueDate) < new Date();
  }).length;

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createAssignment.mutateAsync({
      title,
      classId: newClassId,
      dueDate,
      description,
      maxScore: Number(maxScore),
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    if (created && typeof created === "object" && "id" in created) {
      window.location.href = `/teacher/assignments/${(created as { id: string }).id}`;
    }
  };

  if (loading) return <AssignmentsSkeleton />;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Assignments"
        description={totalAssignments > 0 ? `${totalAssignments} assignments` : "Create homework and collect submissions."}
        isFetching={isFetching}
        action={
          <Button
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create assignment
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard
          label="Total assignments"
          value={String(totalAssignments)}
          tone="purple"
        />
        <ManagementStatCard
          label="Submission rate"
          value={`${submissionRate}%`}
          hint={`${totalSubmissions} of ${totalPossible} submitted`}
          tone={submissionRate >= 80 ? "green" : submissionRate >= 50 ? "blue" : "orange"}
        />
        <ManagementStatCard
          label="Active assignments"
          value={String(activeAssignments)}
          hint={`${gradingAssignments} need grading`}
          tone={gradingAssignments > 0 ? "orange" : "blue"}
        />
        <ManagementStatCard
          label="Overdue"
          value={String(overdueCount)}
          hint={overdueCount > 0 ? "Past due date" : "All on schedule"}
          tone={overdueCount > 0 ? "pink" : "green"}
        />
      </div>

      <div className="dashboard-filter-bar" data-filter-bar="true">
        <div className="relative min-w-[12rem] flex-1 basis-[14rem]" data-search-field="true">
          <input
            type="text"
            placeholder="Search by title or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="box-border h-10 w-full min-w-0 max-w-full rounded-xl border border-border bg-card px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All classes</option>
          {coursesData.classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="grading">Needs grading</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Assignment</th>
              <th className="px-5 py-3">Class</th>
              <th className="px-5 py-3">Due date</th>
              <th className="px-5 py-3">Submissions</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No assignments found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {search ? "Try a different search term." : "Create your first assignment to start collecting submissions from your students."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((assignment) => {
                const isOverdue = assignment.status !== "closed" && new Date(assignment.dueDate) < new Date();
                const submissionPercentage = assignment.total > 0
                  ? Math.round((assignment.submitted / assignment.total) * 100)
                  : 0;

                return (
                  <tr
                    key={assignment.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{assignment.title}</p>
                        </div>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          assignment.status === "grading"
                            ? "bg-brand-orange/10 text-brand-orange"
                            : assignment.status === "closed"
                            ? "bg-green/10 text-green"
                            : "bg-brand-blue/10 text-brand-blue"
                        )}>
                          {assignment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/teacher/classes/${assignment.classId}`}
                        className="text-muted-foreground transition-colors hover:text-brand-purple"
                      >
                        {assignment.className}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-muted-foreground",
                          isOverdue && "text-red-500 font-medium"
                        )}>
                          {assignment.dueDate}
                        </span>
                        {isOverdue && (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              submissionPercentage >= 80
                                ? "bg-green"
                                : submissionPercentage >= 50
                                ? "bg-brand-blue"
                                : "bg-brand-orange"
                            )}
                            style={{ width: `${submissionPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {assignment.submitted}/{assignment.total}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/teacher/assignments/${assignment.id}`}
                        className="text-sm font-semibold text-brand-purple transition-colors hover:underline"
                      >
                        {assignment.status === "grading" ? "Grade →" : "View →"}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {totalAssignments} assignments
          </div>
        )}
      </ManagementPanel>

      <AssignmentModal open={open} title="Create assignment" onClose={() => setOpen(false)}>
        <form onSubmit={onCreate} className="space-y-4">
          <AdminFormField label="Title">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={adminInputClass}
              placeholder="e.g., Chapter 5 Homework"
            />
          </AdminFormField>
          <AdminFormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(adminInputClass, "min-h-[80px] py-2")}
              placeholder="Assignment instructions and details..."
            />
          </AdminFormField>
          <AdminFormField label="Class">
            <select
              value={newClassId}
              onChange={(e) => setNewClassId(e.target.value)}
              className={adminSelectClass}
            >
              {coursesData.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Due date">
            <input
              required
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <AdminFormField label="Max score">
            <input
              required
              type="number"
              min={1}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <Button
            type="submit"
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={createAssignment.isPending}
          >
            {createAssignment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create assignment"
            )}
          </Button>
        </form>
      </AssignmentModal>
    </div>
  );
}
