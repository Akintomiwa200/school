"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTeacherCourses, useTeacherStudents } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { TEACHER_AVATAR_TONES } from "./teacher-data";

const COURSES_EMPTY = { classes: [] as { id: string; name: string }[], courses: [] as { id: string; title: string }[] };

type StudentRow = {
  id: string;
  name: string;
  initials: string;
  avatarTone: keyof typeof TEACHER_AVATAR_TONES;
  classId: string;
  className: string;
  studentId: string;
  averageScore: number;
  workCompleted: number;
  workTotal: number;
};

function StudentsSkeleton() {
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

export function TeacherStudents() {
  const { data: coursesData = COURSES_EMPTY } = useTeacherCourses(COURSES_EMPTY);
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const pageLoading = usePageLoading();
  const { data: students = [], isFetching } = useTeacherStudents<StudentRow[]>(classId || undefined);

  const loading = pageLoading || (isFetching && students.length === 0);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q),
    );
  }, [students, search]);

  const totalStudents = students.length;
  const avgScore = totalStudents > 0 ? Math.round(students.reduce((a, s) => a + s.averageScore, 0) / totalStudents) : 0;
  const topStudent = totalStudents > 0 ? [...students].sort((a, b) => b.averageScore - a.averageScore)[0]! : null;
  const atRisk = students.filter((s) => s.averageScore < 45).length;

  if (loading) return <StudentsSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Students"
        description={totalStudents > 0 ? `${totalStudents} students across your classes` : "All students across your classes with live scores."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Total students" value={String(totalStudents)} tone="purple" />
        <ManagementStatCard label="Class average" value={`${avgScore}%`} hint={avgScore >= 70 ? "Good standing" : avgScore >= 45 ? "Needs improvement" : "Needs attention"} tone={avgScore >= 70 ? "green" : avgScore >= 45 ? "blue" : "orange"} />
        <ManagementStatCard
          label="Top performer"
          value={topStudent ? topStudent.name.split(" ")[0]! : "—"}
          hint={topStudent ? `${topStudent.averageScore}%` : "No data yet"}
          tone="green"
        />
        <ManagementStatCard label="At risk" value={String(atRisk)} hint={atRisk > 0 ? "Below 45% average" : "All performing well"} tone="pink" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative max-w-xs flex-1">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All classes</option>
          {coursesData.classes.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Class</th>
              <th className="px-5 py-3">Work</th>
              <th className="px-5 py-3">Average</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No students found</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{search ? "Try a different search term." : "No students are assigned to your classes yet."}</p>
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const toneColor = student.averageScore >= 70 ? "green" : student.averageScore >= 45 ? "blue" : "orange";
                return (
                  <tr key={student.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold", TEACHER_AVATAR_TONES[student.avatarTone])}>
                          {student.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/teacher/classes/${student.classId}`} className="text-muted-foreground transition-colors hover:text-brand-purple">
                        {student.className}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground tabular-nums">{student.workCompleted}/{student.workTotal}</span>
                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                          <div
                            className={cn("h-full rounded-full transition-all", toneColor === "green" ? "bg-green" : toneColor === "blue" ? "bg-brand-blue" : "bg-brand-orange")}
                            style={{ width: `${Math.min(100, Math.round((student.workCompleted / Math.max(1, student.workTotal)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", toneColor === "green" ? "bg-green/10 text-green" : toneColor === "blue" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange")}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/teacher/students/${student.id}`} className="text-sm font-semibold text-brand-purple transition-colors hover:underline">
                        View profile →
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
            Showing {filtered.length} of {totalStudents} students
          </div>
        )}
      </ManagementPanel>
    </div>
  );
}
