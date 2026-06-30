"use client";

import Link from "next/link";
import { useState } from "react";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherClassDetail } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import {
  TEACHER_AVATAR_TONES,
  getTeacherScoreBarTone,
  type TeacherStudentProficiency,
} from "./teacher-data";
import { TeacherDetailSkeleton, TeacherNotFound } from "./teacher-workflow-ui";

type ClassDetail = {
  id: string;
  name: string;
  label: string;
  students: number;
  room: string;
  schedule: string;
  roster: TeacherStudentProficiency[];
  assignments: { id: string; title: string; dueDate: string; status: string; submitted: number; total: number }[];
  materials: { id: string; name: string; type: string; size: string; sharedWith: string; uploaded: string }[];
};

export function TeacherClassDetail({ classId }: { classId: string }) {
  const pageLoading = usePageLoading();
  const { data: detail, isFetching, isError, isFetched } = useTeacherClassDetail<ClassDetail | null>(classId);
  const [tab, setTab] = useState<"roster" | "assignments" | "materials">("roster");

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <TeacherDetailSkeleton />;
  }

  if (isFetched && (isError || !detail)) {
    return (
      <TeacherNotFound
        title="Class not found"
        description="This class is not assigned to you or the link is invalid."
        backHref="/teacher/classes"
        backLabel="Back to classes"
      />
    );
  }

  if (!detail) return <TeacherDetailSkeleton />;

  return (
    <div className="space-y-6">
      <Link href="/teacher/classes" className="inline-flex text-sm font-medium text-brand-purple hover:underline">
        ← Back to classes
      </Link>
      <ManagementPageHeader
        title={detail.label}
        description={`${detail.room} · ${detail.schedule} · ${detail.students} students`}
        action={
          <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            <Link href={`/teacher/grades?classId=${encodeURIComponent(classId)}`}>Open gradebook</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(["roster", "assignments", "materials"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
              tab === key ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {tab === "roster" ? (
        <ManagementPanel className="overflow-x-auto border border-border p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Work completed</th>
                <th className="px-4 py-3">Average score</th>
              </tr>
            </thead>
            <tbody>
              {detail.roster.map((student) => (
                <tr key={student.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/teacher/students/${student.id}`} className="flex items-center gap-3 hover:text-brand-purple">
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold", TEACHER_AVATAR_TONES[student.avatarTone])}>{student.initials}</span>
                      <span className="font-medium">{student.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{student.workCompleted} / {student.workTotal}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[120px] items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", getTeacherScoreBarTone(student.averageScore))} style={{ width: `${student.averageScore}%` }} />
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums">{student.averageScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagementPanel>
      ) : null}

      {tab === "assignments" ? (
        <div className="space-y-3">
          {detail.assignments.length === 0 ? (
            <ManagementPanel className="border border-border text-sm text-muted-foreground">No assignments for this class yet.</ManagementPanel>
          ) : (
            detail.assignments.map((a) => (
              <ManagementPanel key={a.id} className="flex items-center justify-between border border-border">
                <div>
                  <h3 className="font-bold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">Due {a.dueDate} · {a.submitted}/{a.total} submitted</p>
                </div>
                <Button asChild variant="outline" className="rounded-full"><Link href={`/teacher/assignments/${a.id}`}>Open</Link></Button>
              </ManagementPanel>
            ))
          )}
          <Button asChild className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            <Link href="/teacher/assignments">Create assignment</Link>
          </Button>
        </div>
      ) : null}

      {tab === "materials" ? (
        <div className="space-y-3">
          {detail.materials.length === 0 ? (
            <ManagementPanel className="border border-border text-sm text-muted-foreground">No materials shared with this class yet.</ManagementPanel>
          ) : (
            detail.materials.map((m) => (
              <ManagementPanel key={m.id} className="flex items-center justify-between border border-border">
                <div>
                  <h3 className="font-bold">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.type} · {m.size} · {m.uploaded}</p>
                </div>
                <Button asChild variant="outline" className="rounded-full"><Link href={`/teacher/materials/${m.id}`}>Manage</Link></Button>
              </ManagementPanel>
            ))
          )}
          <Button asChild variant="outline" className="rounded-full"><Link href="/teacher/materials">Upload material</Link></Button>
        </div>
      ) : null}
    </div>
  );
}
