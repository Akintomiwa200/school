"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useCreateTeacherAttendanceSession, useTeacherAttendance, useTeacherCourses } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { TeacherPageHeader, teacherInitialLoading } from "./teacher-workflow-ui";

type SessionItem = {
  id: string;
  className: string;
  classId: string;
  time: string;
  date: string;
  marked: boolean;
  present: number;
  absent: number;
  rosterSize?: number;
};

const COURSES_EMPTY = {
  classes: [] as { id: string; name: string }[],
  courses: [] as never[]
};

function AttendanceSkeleton() {
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

function Modal({
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

export function TeacherAttendance() {
  const { data: sessions = [], isFetching, isFetched } = useTeacherAttendance<SessionItem[]>([]);
  const { data: coursesData = COURSES_EMPTY, isFetching: coursesFetching } = useTeacherCourses(COURSES_EMPTY);
  const createSession = useCreateTeacherAttendanceSession();
  const pageLoading = usePageLoading();

  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newClassId, setNewClassId] = useState(coursesData.classes[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("08:00");

  const loading = teacherInitialLoading(pageLoading, isFetching || coursesFetching, isFetched);

  // Filter by class if selected
  const classFiltered = useMemo(() => {
    if (!classId) return sessions;
    return sessions.filter((s) => s.classId === classId);
  }, [sessions, classId]);

  // Filter by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return classFiltered;
    const q = search.toLowerCase();
    return classFiltered.filter(
      (s) =>
        s.className.toLowerCase().includes(q) ||
        s.date.includes(q)
    );
  }, [classFiltered, search]);

  const totalSessions = sessions.length;
  const markedSessions = sessions.filter((s) => s.marked).length;
  const unmarkedSessions = totalSessions - markedSessions;
  const totalPresent = sessions.reduce((sum, s) => sum + s.present, 0);
  const totalAbsent = sessions.reduce((sum, s) => sum + s.absent, 0);
  const attendanceRate = totalPresent + totalAbsent > 0
    ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
    : 0;
  const todaySession = sessions.find((s) => s.date === new Date().toISOString().slice(0, 10));

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createSession.mutateAsync({ classId: newClassId, date, time });
    setOpen(false);
    if (created && typeof created === "object" && "id" in created) {
      window.location.href = `/teacher/attendance/${(created as { id: string }).id}`;
    }
  };

  if (loading) return <AttendanceSkeleton />;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Attendance"
        description={totalSessions > 0 ? `${totalSessions} attendance sessions` : "Mark and review daily class attendance per student."}
        isFetching={isFetching}
        action={
          <Button
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New session
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard
          label="Total sessions"
          value={String(totalSessions)}
          tone="purple"
        />
        <ManagementStatCard
          label="Attendance rate"
          value={`${attendanceRate}%`}
          hint={attendanceRate >= 90 ? "Excellent" : attendanceRate >= 75 ? "Good" : "Needs attention"}
          tone={attendanceRate >= 90 ? "green" : attendanceRate >= 75 ? "blue" : "orange"}
        />
        <ManagementStatCard
          label="Today's session"
          value={todaySession ? (todaySession.marked ? "Marked" : "Pending") : "Not created"}
          hint={todaySession ? `${todaySession.className}` : "Create a session for today"}
          tone={todaySession?.marked ? "green" : "orange"}
        />
        <ManagementStatCard
          label="Unmarked sessions"
          value={String(unmarkedSessions)}
          hint={unmarkedSessions > 0 ? "Requires attention" : "All sessions marked"}
          tone={unmarkedSessions > 0 ? "pink" : "green"}
        />
      </div>

      <div className="dashboard-filter-bar" data-filter-bar="true">
        <div className="relative min-w-[12rem] flex-1 basis-[14rem]" data-search-field="true">
          <input
            type="text"
            placeholder="Search by class or date..."
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
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Class</th>
              <th className="px-5 py-3">Date & Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Attendance</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No attendance sessions found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {search ? "Try a different search term." : "Create a session to start marking attendance for your classes."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((session) => {
                const totalStudents = session.present + session.absent;
                const sessionRate = totalStudents > 0
                  ? Math.round((session.present / totalStudents) * 100)
                  : 0;

                return (
                  <tr
                    key={session.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{session.className}</p>
                        {session.rosterSize != null && (
                          <p className="text-xs text-muted-foreground">{session.rosterSize} students on roster</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-muted-foreground">{session.date}</p>
                        <p className="text-xs text-muted-foreground">{session.time}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        session.marked
                          ? "bg-green/10 text-green"
                          : "bg-brand-orange/10 text-brand-orange"
                      )}>
                        {session.marked ? "Marked" : "Not marked"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {session.marked ? (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                sessionRate >= 90 ? "bg-green" : sessionRate >= 75 ? "bg-brand-blue" : "bg-brand-orange"
                              )}
                              style={{ width: `${sessionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {session.present}/{totalStudents} present
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/teacher/attendance/${session.id}`}
                        className="text-sm font-semibold text-brand-purple transition-colors hover:underline"
                      >
                        {session.marked ? "View / edit →" : "Mark now →"}
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
            Showing {filtered.length} of {totalSessions} sessions
          </div>
        )}
      </ManagementPanel>

      <Modal open={open} title="Create attendance session" onClose={() => setOpen(false)}>
        <form onSubmit={onCreate} className="space-y-4">
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
          <AdminFormField label="Date">
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <AdminFormField label="Time">
            <input
              required
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <Button
            type="submit"
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={createSession.isPending}
          >
            {createSession.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create session"
            )}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
