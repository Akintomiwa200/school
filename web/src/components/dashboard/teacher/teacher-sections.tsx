"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useAddTeacherMaterial,
  useCreateTeacherAssignment,
  useCreateTeacherAttendanceSession,
  useTeacherAssignments,
  useTeacherAttendance,
  useTeacherCourses,
  useTeacherMaterials,
  useTeacherTimetable,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  TEACHER_ASSIGNMENTS,
  TEACHER_ATTENDANCE_SESSIONS,
  TEACHER_MATERIALS,
  TEACHER_TIMETABLE,
  buildTeacherCoursesFallback,
} from "./teacher-data";

const COURSES_FALLBACK = buildTeacherCoursesFallback();

function Skeleton() {
  return <div className="animate-pulse space-y-5"><div className="h-10 w-64 rounded-lg bg-muted" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-[20px] bg-muted" />)}</div></div>;
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
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
        </div>
      </ManagementPanel>
    </div>
  );
}

export function TeacherCourses() {
  const { data = COURSES_FALLBACK, isFetching } = useTeacherCourses(COURSES_FALLBACK);
  const loading = usePageLoading() || isFetching;

  if (loading) return <Skeleton />;
  const firstCourseId = data.courses[0]?.id;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Courses"
        description="Course content and lesson plans."
        action={
          firstCourseId ? (
            <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
              <Link href={`/teacher/courses/${firstCourseId}`}><Plus className="mr-2 h-4 w-4" />Manage modules</Link>
            </Button>
          ) : null
        }
      />
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
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/teacher/courses/${c.id}`}>Open<ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
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
  const { data: coursesData = COURSES_FALLBACK } = useTeacherCourses(COURSES_FALLBACK);
  const createSession = useCreateTeacherAttendanceSession();
  const loading = usePageLoading() || isFetching;
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(coursesData.classes[0]?.id ?? "class-a");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("08:00");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createSession.mutateAsync({ classId, date, time });
    setOpen(false);
    if (created && typeof created === "object" && "id" in created) {
      window.location.href = `/teacher/attendance/${(created as { id: string }).id}`;
    }
  };

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Attendance"
        description="Mark and review daily class attendance per student."
        action={
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New session
          </Button>
        }
      />
      <div className="space-y-3">
        {sessions.map((s) => (
          <ManagementPanel key={s.id} className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold">{s.className}</h3>
              <p className="text-sm text-muted-foreground">{s.date} · {s.time}</p>
              {"rosterSize" in s && typeof s.rosterSize === "number" ? (
                <p className="mt-1 text-xs text-muted-foreground">{s.rosterSize} students on roster</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {s.marked ? (
                <span className="text-sm text-green">{s.present} present · {s.absent} absent</span>
              ) : (
                <span className="text-sm text-brand-orange">Not marked</span>
              )}
              <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                <Link href={`/teacher/attendance/${s.id}`}>{s.marked ? "View / edit" : "Mark now"}</Link>
              </Button>
            </div>
          </ManagementPanel>
        ))}
      </div>

      <Modal open={open} title="Create attendance session" onClose={() => setOpen(false)}>
        <form onSubmit={onCreate} className="space-y-4">
          <AdminFormField label="Class">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={adminSelectClass}>
              {coursesData.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Date">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Time">
            <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <Button type="submit" className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={createSession.isPending}>
            {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create session"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export function TeacherAssignments() {
  const { data: coursesData = COURSES_FALLBACK } = useTeacherCourses(COURSES_FALLBACK);
  const { data: assignments = TEACHER_ASSIGNMENTS, isFetching } = useTeacherAssignments(TEACHER_ASSIGNMENTS);
  const createAssignment = useCreateTeacherAssignment();
  const loading = usePageLoading() || isFetching;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState(coursesData.classes[0]?.id ?? "class-a");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [maxScore, setMaxScore] = useState("100");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createAssignment.mutateAsync({
      title,
      classId,
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

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Assignments"
        description="Create homework and collect submissions."
        action={
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Create assignment
          </Button>
        }
      />
      <div className="space-y-3">
        {assignments.map((a) => (
          <ManagementPanel key={a.id} className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{a.title}</h3>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", a.status === "grading" ? "bg-brand-orange/15 text-brand-orange" : a.status === "closed" ? "bg-green/15 text-green" : "bg-brand-blue/15 text-brand-blue")}>{a.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{a.className} · Due {a.dueDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{a.submitted}/{a.total} submitted</span>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/teacher/assignments/${a.id}`}>Grade</Link>
              </Button>
            </div>
          </ManagementPanel>
        ))}
      </div>

      <Modal open={open} title="Create assignment" onClose={() => setOpen(false)}>
        <form onSubmit={onCreate} className="space-y-4">
          <AdminFormField label="Title">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={cn(adminInputClass, "min-h-[80px] py-2")} />
          </AdminFormField>
          <AdminFormField label="Class">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={adminSelectClass}>
              {coursesData.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Due date">
            <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Max score">
            <input required type="number" min={1} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <Button type="submit" className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={createAssignment.isPending}>
            {createAssignment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export function TeacherMaterials() {
  const { data: materials = TEACHER_MATERIALS, isFetching } = useTeacherMaterials(TEACHER_MATERIALS);
  const { data: coursesData = COURSES_FALLBACK } = useTeacherCourses(COURSES_FALLBACK);
  const addMaterial = useAddTeacherMaterial();
  const loading = usePageLoading() || isFetching;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("PDF");
  const [size, setSize] = useState("1.0 MB");
  const [classId, setClassId] = useState(coursesData.classes[0]?.id ?? "class-a");

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addMaterial.mutateAsync({ name, classId, type, size });
    setOpen(false);
    setName("");
    if (created && typeof created === "object" && "id" in created) {
      window.location.href = `/teacher/materials/${(created as { id: string }).id}`;
    }
  };

  if (loading) return <Skeleton />;
  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Materials"
        description="Upload and share learning resources."
        action={
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Upload file
          </Button>
        }
      />
      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead><tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><th className="px-4 py-3">File</th><th className="px-4 py-3">Shared with</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link href={`/teacher/materials/${m.id}`} className="font-semibold hover:text-brand-purple">{m.name}</Link>
                  <p className="text-xs text-muted-foreground">{m.type} · {m.size}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.sharedWith}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.uploaded}</td>
                <td className="px-4 py-3">
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={`/teacher/materials/${m.id}`}>Manage</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>

      <Modal open={open} title="Upload material" onClose={() => setOpen(false)}>
        <form onSubmit={onUpload} className="space-y-4">
          <AdminFormField label="File name">
            <input required value={name} onChange={(e) => setName(e.target.value)} className={adminInputClass} placeholder="e.g. Unit 4 slides" />
          </AdminFormField>
          <AdminFormField label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={adminSelectClass}>
              {["PDF", "DOCX", "PPTX", "Video", "Link"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </AdminFormField>
          <AdminFormField label="Size">
            <input value={size} onChange={(e) => setSize(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Share with class">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={adminSelectClass}>
              {coursesData.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </AdminFormField>
          <Button type="submit" className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={addMaterial.isPending}>
            {addMaterial.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
          </Button>
        </form>
      </Modal>
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
                  {"classId" in p && p.classId ? (
                    <Link href={`/teacher/classes/${p.classId}`} className="text-sm font-semibold hover:text-brand-purple">
                      {p.subject}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold">{p.subject}</p>
                  )}
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
