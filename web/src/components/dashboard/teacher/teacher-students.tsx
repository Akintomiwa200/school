"use client";

import Link from "next/link";
import { useState } from "react";
import { useTeacherCourses, useTeacherStudents } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { TEACHER_AVATAR_TONES, buildTeacherCoursesFallback } from "./teacher-data";

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

export function TeacherStudents() {
  const coursesFallback = buildTeacherCoursesFallback();
  const { data: coursesData = coursesFallback } = useTeacherCourses(coursesFallback);
  const [classId, setClassId] = useState("");
  const pageLoading = usePageLoading();
  const { data: students = [], isFetching } = useTeacherStudents<StudentRow[]>(classId || undefined);

  if (pageLoading && isFetching && students.length === 0) {
    return <div className="animate-pulse space-y-5"><div className="h-10 w-64 rounded-lg bg-muted" /><div className="h-72 rounded-[20px] bg-muted" /></div>;
  }

  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Students" description="All students across your classes with live scores." />
      <ManagementPanel className="border border-border">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filter by class</label>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="mt-2 h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All classes</option>
          {coursesData.classes.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </ManagementPanel>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Work</th>
              <th className="px-4 py-3">Average</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No students found.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold", TEACHER_AVATAR_TONES[student.avatarTone])}>
                        {student.initials}
                      </span>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/teacher/classes/${student.classId}`} className="text-muted-foreground hover:text-brand-purple">
                      {student.className}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{student.workCompleted}/{student.workTotal}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{student.averageScore}%</td>
                  <td className="px-4 py-3">
                    <Link href={`/teacher/students/${student.id}`} className="text-sm font-medium text-brand-purple hover:underline">
                      View profile
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
