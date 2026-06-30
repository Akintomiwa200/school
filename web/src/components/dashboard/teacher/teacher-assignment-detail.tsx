"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGradeTeacherSubmission,
  useTeacherAssignment,
  useUpdateTeacherAssignment,
} from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { AdminBackLink, AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { TeacherDetailSkeleton, TeacherNotFound } from "./teacher-workflow-ui";

type AssignmentDetail = {
  id: string;
  title: string;
  classId: string;
  className: string;
  dueDate: string;
  status: string;
  description?: string;
  maxScore: number;
  submitted: number;
  total: number;
  submissions: {
    studentId: string;
    studentName: string;
    submitted: boolean;
    score: number | null;
    submittedAt: string | null;
  }[];
};

export function TeacherAssignmentDetail({ assignmentId }: { assignmentId: string }) {
  const pageLoading = usePageLoading();
  const { data: assignment, isFetching, isError, isFetched } = useTeacherAssignment<AssignmentDetail | null>(assignmentId);
  const gradeSubmission = useGradeTeacherSubmission(assignmentId);
  const updateAssignment = useUpdateTeacherAssignment(assignmentId);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <TeacherDetailSkeleton />;
  }

  if (isFetched && (isError || !assignment)) {
    return (
      <TeacherNotFound
        title="Assignment not found"
        description="This assignment may have been removed or the link is invalid."
        backHref="/teacher/assignments"
        backLabel="Back to assignments"
      />
    );
  }

  if (!assignment) return <TeacherDetailSkeleton />;

  const openEdit = () => {
    setTitle(assignment.title);
    setDueDate(assignment.dueDate);
    setDescription(assignment.description ?? "");
    setEditOpen(true);
  };

  const onSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAssignment.mutateAsync({ title, dueDate, description });
    setEditOpen(false);
  };

  const onCloseAssignment = async () => {
    await updateAssignment.mutateAsync({ status: "closed" });
  };

  const onGrade = async (studentId: string) => {
    const raw = scores[studentId];
    if (raw == null || raw === "") return;
    const score = Number(raw);
    if (Number.isNaN(score)) return;
    await gradeSubmission.mutateAsync({ studentId, score });
    setScores((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/teacher/assignments" label="Back to assignments" />
      <ManagementPageHeader
        title={assignment.title}
        description={`${assignment.className} · Due ${assignment.dueDate}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={openEdit}>Edit</Button>
            {assignment.status !== "closed" ? (
              <Button variant="outline" className="rounded-full" disabled={updateAssignment.isPending} onClick={onCloseAssignment}>
                Close assignment
              </Button>
            ) : null}
          </div>
        }
      />

      {editOpen ? (
        <ManagementPanel className="border border-border">
          <form onSubmit={onSaveMeta} className="space-y-4">
            <AdminFormField label="Title"><input required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} /></AdminFormField>
            <AdminFormField label="Due date"><input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={adminInputClass} /></AdminFormField>
            <AdminFormField label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className={cn(adminInputClass, "min-h-[80px] py-2")} /></AdminFormField>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={updateAssignment.isPending}>Save</Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </form>
        </ManagementPanel>
      ) : null}

      <ManagementPanel className="border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{assignment.description}</p>
            <p className="mt-2 text-sm font-semibold">
              {assignment.submitted}/{assignment.total} submitted · Max score {assignment.maxScore}
            </p>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", assignment.status === "grading" ? "bg-brand-orange/15 text-brand-orange" : assignment.status === "closed" ? "bg-green/15 text-green" : "bg-brand-blue/15 text-brand-blue")}>
            {assignment.status}
          </span>
        </div>
      </ManagementPanel>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {assignment.submissions.map((submission) => {
              const currentScore = scores[submission.studentId] ?? (submission.score != null ? String(submission.score) : "");
              return (
                <tr key={submission.studentId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/teacher/students/${submission.studentId}`} className="hover:text-brand-purple">{submission.studentName}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {submission.submitted ? (submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "Yes") : "Not yet"}
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min={0} max={assignment.maxScore} value={currentScore} onChange={(e) => setScores((prev) => ({ ...prev, [submission.studentId]: e.target.value }))} className={cn(adminInputClass, "max-w-[100px]")} placeholder="—" disabled={assignment.status === "closed"} />
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={gradeSubmission.isPending || assignment.status === "closed"} onClick={() => onGrade(submission.studentId)}>
                      {gradeSubmission.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ManagementPanel>

      <p className="text-sm text-muted-foreground">
        Grades sync to the <Link href={`/teacher/grades?classId=${encodeURIComponent(assignment.classId)}`} className="font-medium text-brand-purple hover:underline">gradebook</Link> and class dashboard in real time.
      </p>
    </div>
  );
}
