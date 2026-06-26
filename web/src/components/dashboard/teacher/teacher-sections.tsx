"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useTeacherAssignments,
  useTeacherAttendance,
  useTeacherCourses,
  useTeacherTimetable,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ManagementActionLink,
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  TEACHER_ASSIGNMENTS,
  TEACHER_ATTENDANCE_SESSIONS,
  TEACHER_CLASSES,
  TEACHER_COURSES,
  TEACHER_DASHBOARD_STATS,
  TEACHER_MATERIALS,
  TEACHER_QUICK_ACTIONS,
  TEACHER_TIMETABLE,
} from "./teacher-data";

const COURSES_FALLBACK = { classes: TEACHER_CLASSES, courses: TEACHER_COURSES };

function Skeleton() {
  return <div className="animate-pulse space-y-5"><div className="h-10 w-64 rounded-lg bg-muted" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-[20px] bg-muted" />)}</div></div>;
}

export function TeacherDashboard() {
  const loading = usePageLoading(400);
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] ?? "Teacher";

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title={`Good morning, ${name}`}
        description="Your classes, assignments, and teaching schedule."
        action={<Button asChild className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"><Link href="/teacher/attendance">Mark attendance</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TEACHER_DASHBOARD_STATS.map((s) => <ManagementStatCard key={s.id} {...s} />)}
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <ManagementPanel className="border border-border lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TEACHER_QUICK_ACTIONS.map((a) => <ManagementActionLink key={a.href} {...a} />)}
          </div>
        </ManagementPanel>
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Today's sessions</h2>
          <ul className="mt-4 space-y-3">
            {TEACHER_ATTENDANCE_SESSIONS.map((s) => (
              <li key={s.id} className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-sm font-semibold">{s.className}</p>
                <p className="text-xs text-muted-foreground">{s.time} · {s.marked ? `${s.present} present` : "Not marked"}</p>
              </li>
            ))}
          </ul>
        </ManagementPanel>
      </div>
    </div>
  );
}

export function TeacherClasses() {
  const { data = COURSES_FALLBACK, isFetching } = useTeacherCourses(COURSES_FALLBACK);
  const loading = usePageLoading() || isFetching;
  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="My classes" description="Classes and sections you teach." />
      <div className="grid gap-4 sm:grid-cols-2">
        {data.classes.map((c) => (
          <ManagementPanel key={c.id} className="border border-border">
            <h3 className="font-bold">{c.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.room} · {c.schedule}</p>
            <p className="mt-3 text-sm"><span className="font-semibold">{c.students}</span> students</p>
            <Button variant="outline" className="mt-4 w-full rounded-full">View roster</Button>
          </ManagementPanel>
        ))}
      </div>
    </div>
  );
}

export function TeacherCourses() {
  const { data = COURSES_FALLBACK, isFetching } = useTeacherCourses(COURSES_FALLBACK);
  const loading = usePageLoading() || isFetching;
  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Courses" description="Course content and lesson plans." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />New module</Button>} />
      <div className="space-y-3">
        {data.courses.map((c) => (
          <ManagementPanel key={c.id} className="border border-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.modules} modules · {c.lessons} lessons · {c.students} students</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold">{c.progress}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <Button variant="outline" className="rounded-full">Open<ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-purple" style={{ width: `${c.progress}%` }} /></div>
          </ManagementPanel>
        ))}
      </div>
    </div>
  );
}

export function TeacherAttendance() {
  const { data: sessions = TEACHER_ATTENDANCE_SESSIONS, isFetching } = useTeacherAttendance(TEACHER_ATTENDANCE_SESSIONS);
  const loading = usePageLoading() || isFetching;
  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Attendance" description="Mark and review daily class attendance." />
      <div className="space-y-3">
        {sessions.map((s) => (
          <ManagementPanel key={s.id} className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold">{s.className}</h3>
              <p className="text-sm text-muted-foreground">{s.date} · {s.time}</p>
            </div>
            {s.marked ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-green">{s.present} present · {s.absent} absent</span>
                <Button variant="outline" className="rounded-full">View</Button>
              </div>
            ) : (
              <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">Mark now</Button>
            )}
          </ManagementPanel>
        ))}
      </div>
    </div>
  );
}

export function TeacherAssignments() {
  const { data: assignments = TEACHER_ASSIGNMENTS, isFetching } = useTeacherAssignments(TEACHER_ASSIGNMENTS);
  const loading = usePageLoading() || isFetching;
  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Assignments" description="Create homework and collect submissions." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Create assignment</Button>} />
      <div className="space-y-3">
        {assignments.map((a) => (
          <ManagementPanel key={a.id} className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{a.title}</h3>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", a.status === "grading" ? "bg-brand-orange/15 text-brand-orange" : "bg-brand-blue/15 text-brand-blue")}>{a.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{a.className} · Due {a.dueDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{a.submitted}/{a.total} submitted</span>
              <Button variant="outline" className="rounded-full">Grade</Button>
            </div>
          </ManagementPanel>
        ))}
      </div>
    </div>
  );
}

export function TeacherMaterials() {
  const loading = usePageLoading();
  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Materials" description="Upload and share learning resources." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Upload file</Button>} />
      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead><tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><th className="px-4 py-3">File</th><th className="px-4 py-3">Shared with</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {TEACHER_MATERIALS.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3"><p className="font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.type} · {m.size}</p></td>
                <td className="px-4 py-3 text-muted-foreground">{m.sharedWith}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.uploaded}</td>
                <td className="px-4 py-3"><Button variant="outline" size="sm" className="rounded-full">Share</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}

export function TeacherTimetable() {
  const { data: timetable = TEACHER_TIMETABLE, isFetching } = useTeacherTimetable(TEACHER_TIMETABLE);
  const loading = usePageLoading() || isFetching;
  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Timetable" description="Your weekly teaching schedule." />
      <div className="grid gap-4 lg:grid-cols-3">
        {timetable.map((day) => (
          <ManagementPanel key={day.day} className="border border-border">
            <h3 className="font-bold">{day.day}</h3>
            <ul className="mt-4 space-y-3">
              {day.periods.map((p, i) => (
                <li key={i} className="rounded-xl bg-muted/40 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">{p.time}</p>
                  <p className="text-sm font-semibold">{p.subject}</p>
                  <p className="text-xs text-muted-foreground">{p.room}</p>
                </li>
              ))}
            </ul>
          </ManagementPanel>
        ))}
      </div>
    </div>
  );
}
