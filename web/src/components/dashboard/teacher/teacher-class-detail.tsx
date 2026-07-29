"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  Trophy,
  Users,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useTeacherClassDetail } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import {
  TEACHER_AVATAR_TONES,
  getTeacherScoreBarTone,
  type TeacherStudentProficiency,
} from "./teacher-data";
import { TeacherDetailSkeleton, TeacherLiveBadge, TeacherNotFound } from "./teacher-workflow-ui";

type ClassDetail = {
  id: string;
  name: string;
  label: string;
  students: number;
  room: string;
  schedule: string;
  roster: TeacherStudentProficiency[];
  assignments: {
    id: string;
    title: string;
    dueDate: string;
    status: string;
    submitted: number;
    total: number;
  }[];
  materials: {
    id: string;
    name: string;
    type: string;
    size: string;
    sharedWith: string;
    uploaded: string;
  }[];
};

const TAB_OPTIONS = [
  { key: "roster", label: "Student Roster", icon: Users },
  { key: "assignments", label: "Assignments", icon: ClipboardList },
  { key: "materials", label: "Materials", icon: FileText },
] as const;

type TabKey = (typeof TAB_OPTIONS)[number]["key"];

const RANK_BADGES = {
  1: "bg-yellow-400 text-yellow-900 ring-yellow-300",
  2: "bg-gray-300 text-gray-700 ring-gray-400",
  3: "bg-orange-300 text-orange-800 ring-orange-400",
} as const;

function getRankBadge(rank: number) {
  if (rank <= 3) return RANK_BADGES[rank as keyof typeof RANK_BADGES];
  return "bg-muted text-muted-foreground ring-border";
}

function formatFileSize(size?: string): string {
  if (!size) return "—";
  const num = parseFloat(size);
  if (isNaN(num)) return size;
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green";
  if (score >= 60) return "text-brand-blue";
  if (score >= 40) return "text-brand-orange";
  return "text-brand-pink";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-green/10";
  if (score >= 60) return "bg-brand-blue/10";
  if (score >= 40) return "bg-brand-orange/10";
  return "bg-brand-pink/10";
}

export function TeacherClassDetail({ classId }: { classId: string }) {
  const { data: session } = useSession();
  const pageLoading = usePageLoading();
  const {
    data: detail,
    isFetching,
    isError,
    isFetched,
  } = useTeacherClassDetail<ClassDetail | null>(classId);
  const [tab, setTab] = useState<TabKey>("roster");
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = (pageLoading && isFetching) || (isFetching && !isFetched);

  // Filter roster by search
  const filteredRoster = useMemo(() => {
    if (!detail?.roster) return [];
    if (!searchQuery.trim()) return detail.roster;
    const query = searchQuery.toLowerCase();
    return detail.roster.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
  }, [detail?.roster, searchQuery]);

  // Calculate class statistics
  const stats = useMemo(() => {
    if (!detail) return null;

    const sortedByScore = [...detail.roster].sort(
      (a, b) => b.averageScore - a.averageScore
    );

    const topPerformer = sortedByScore[0];
    const avgClassScore =
      detail.roster.length > 0
        ? Math.round(
            detail.roster.reduce((sum, s) => sum + s.averageScore, 0) /
              detail.roster.length
          )
        : 0;

    const totalAssignments = detail.assignments.length;
    const activeAssignments = detail.assignments.filter(
      (a) => a.status === "active" || a.status === "open"
    ).length;
    const totalMaterials = detail.materials.length;
    const totalWorkItems = detail.roster.reduce(
      (sum, s) => sum + s.workTotal,
      0
    );
    const completedWorkItems = detail.roster.reduce(
      (sum, s) => sum + s.workCompleted,
      0
    );
    const completionRate =
      totalWorkItems > 0
        ? Math.round((completedWorkItems / totalWorkItems) * 100)
        : 0;

    return {
      topPerformer,
      avgClassScore,
      totalAssignments,
      activeAssignments,
      totalMaterials,
      totalWorkItems,
      completedWorkItems,
      completionRate,
    };
  }, [detail]);

  if (isLoading) return <TeacherDetailSkeleton />;

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
      {/* Back Navigation */}
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classes
      </Link>

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl truncate">
              {detail.label}
            </h1>
            <TeacherLiveBadge isFetching={isFetching} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {detail.room}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {detail.schedule}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {detail.students} students
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link href={`/teacher/attendance?classId=${encodeURIComponent(classId)}`}>
              <UserCheck className="mr-2 h-4 w-4" />
              Attendance
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            <Link href={`/teacher/grades?classId=${encodeURIComponent(classId)}`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Gradebook
            </Link>
          </Button>
        </div>
      </div>

      {/* Class Overview Banner */}
      <ManagementPanel className="relative overflow-hidden border-0 bg-gradient-to-r from-brand-purple to-brand-blue p-0 text-white shadow-float">
        <div className="relative z-10 p-6 sm:p-8 sm:pr-40 lg:pr-48">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/85">Class Overview</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
              {detail.label}
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
              {stats
                ? `${stats.totalAssignments} assignments · ${stats.totalMaterials} materials · ${stats.avgClassScore}% average score`
                : "Manage your class roster, assignments, and materials."}
            </p>
            {stats && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium">
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {stats.activeAssignments} Active Assignments
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  {stats.completionRate}% Work Complete
                </span>
                {stats.topPerformer && (
                  <span className="rounded-full bg-white/15 px-3 py-1.5">
                    <Trophy className="mr-1 inline h-3 w-3" />
                    Top: {stats.topPerformer.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 sm:flex lg:right-10 lg:h-32 lg:w-32"
        >
          <GraduationCap className="h-14 w-14 text-white/90 lg:h-16 lg:w-16" />
        </div>
      </ManagementPanel>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10">
                <Users className="h-5 w-5 text-brand-purple" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{detail.students}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10">
                <BarChart3 className="h-5 w-5 text-brand-blue" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.avgClassScore}%</p>
                <p className="text-xs text-muted-foreground">Class Average</p>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10">
                <CheckCircle2 className="h-5 w-5 text-green" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Work Completed</p>
              </div>
            </div>
          </ManagementPanel>

          <ManagementPanel className="border border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10">
                <Trophy className="h-5 w-5 text-brand-orange" />
              </span>
              <div>
                <p className="text-2xl font-bold truncate">
                  {stats.topPerformer?.name || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.topPerformer
                    ? `Top Performer · ${stats.topPerformer.averageScore}%`
                    : "No data yet"}
                </p>
              </div>
            </div>
          </ManagementPanel>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {TAB_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              tab === key
                ? "bg-brand-purple text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Roster Tab */}
      {tab === "roster" && (
        <div className="space-y-4">
          {/* Search */}
          {detail.roster.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full max-w-sm rounded-xl border border-border bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {detail.roster.length === 0 ? (
            <ManagementPanel className="border border-border py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No students enrolled
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Students will appear here once they are added to this class.
              </p>
            </ManagementPanel>
          ) : filteredRoster.length === 0 ? (
            <ManagementPanel className="border border-border py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No students found
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                No students match "{searchQuery}". Try a different search.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </ManagementPanel>
          ) : (
            <ManagementPanel className="overflow-hidden border border-border p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 font-medium">#</th>
                      <th className="px-5 py-3 font-medium">Student</th>
                      <th className="px-5 py-3 font-medium">Work Completed</th>
                      <th className="px-5 py-3 font-medium">Average Score</th>
                      <th className="px-5 py-3 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRoster.map((student, index) => {
                      const scoreColor = getScoreColor(student.averageScore);
                      const scoreBg = getScoreBg(student.averageScore);
                      const rank = index + 1;

                      return (
                        <tr
                          key={student.id}
                          className="transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-3.5">
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-2",
                                getRankBadge(rank)
                              )}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/teacher/students/${student.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <span
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-110",
                                  TEACHER_AVATAR_TONES[student.avatarTone]
                                )}
                              >
                                {student.initials}
                              </span>
                              <div>
                                <p className="font-semibold text-foreground group-hover:text-brand-purple transition-colors">
                                  {student.name}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-5 py-3.5">
                            <div>
                              <p className="text-muted-foreground tabular-nums">
                                {student.workCompleted} / {student.workTotal}
                              </p>
                              {student.workTotal > 0 && (
                                <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-brand-purple transition-all"
                                    style={{
                                      width: `${
                                        (student.workCompleted / student.workTotal) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    getTeacherScoreBarTone(student.averageScore)
                                  )}
                                  style={{ width: `${student.averageScore}%` }}
                                />
                              </div>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                                  scoreBg,
                                  scoreColor
                                )}
                              >
                                {student.averageScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/teacher/students/${student.id}`}
                              className="inline-flex items-center text-sm font-semibold text-brand-purple hover:underline"
                            >
                              View <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredRoster.length < detail.roster.length && (
                <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  Showing {filteredRoster.length} of {detail.roster.length} students
                </div>
              )}
            </ManagementPanel>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {tab === "assignments" && (
        <div className="space-y-4">
          {detail.assignments.length === 0 ? (
            <ManagementPanel className="border border-border py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No assignments yet
              </p>
              <p className="mt-1 mb-6 text-xs text-muted-foreground/70">
                Create assignments for this class to start tracking student progress.
              </p>
              <Button
                asChild
                className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
              >
                <Link href="/teacher/assignments">Create assignment</Link>
              </Button>
            </ManagementPanel>
          ) : (
            <>
              <div className="space-y-3">
                {detail.assignments.map((assignment) => {
                  const submissionRate =
                    assignment.total > 0
                      ? Math.round(
                          (assignment.submitted / assignment.total) * 100
                        )
                      : 0;

                  return (
                    <Link
                      key={assignment.id}
                      href={`/teacher/assignments/${assignment.id}`}
                      className="block"
                    >
                      <ManagementPanel className="border border-border transition-all hover:-translate-y-0.5 hover:shadow-float">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground truncate">
                                {assignment.title}
                              </h3>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0",
                                  assignment.status === "active"
                                    ? "bg-green/10 text-green"
                                    : assignment.status === "draft"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-brand-pink/10 text-brand-pink"
                                )}
                              >
                                {assignment.status}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due {assignment.dueDate}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {assignment.submitted}/{assignment.total} submitted
                              </span>
                            </div>
                            {/* Submission Progress */}
                            {assignment.total > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    Submission progress
                                  </span>
                                  <span className="text-[10px] font-bold tabular-nums text-brand-purple">
                                    {submissionRate}%
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-brand-purple transition-all"
                                    style={{ width: `${submissionRate}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                        </div>
                      </ManagementPanel>
                    </Link>
                  );
                })}
              </div>
              <Button
                asChild
                className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
              >
                <Link href="/teacher/assignments">Create assignment</Link>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Materials Tab */}
      {tab === "materials" && (
        <div className="space-y-4">
          {detail.materials.length === 0 ? (
            <ManagementPanel className="border border-border py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No materials yet
              </p>
              <p className="mt-1 mb-6 text-xs text-muted-foreground/70">
                Share materials with your class to support their learning.
              </p>
              <Button
                asChild
                className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
              >
                <Link href="/teacher/materials">Upload material</Link>
              </Button>
            </ManagementPanel>
          ) : (
            <>
              <div className="space-y-3">
                {detail.materials.map((material) => (
                  <ManagementPanel
                    key={material.id}
                    className="border border-border transition-all hover:-translate-y-0.5 hover:shadow-float"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10">
                          <FileText className="h-5 w-5 text-brand-blue" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground truncate">
                            {material.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{material.type}</span>
                            <span>{formatFileSize(material.size)}</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {material.uploaded}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <Link href={`/teacher/materials/${material.id}`}>
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Download
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Link href={`/teacher/materials/${material.id}`}>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </ManagementPanel>
                ))}
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full"
              >
                <Link href="/teacher/materials">Upload material</Link>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      {detail.roster.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Showing {tab === "roster" ? filteredRoster.length : tab === "assignments" ? detail.assignments.length : detail.materials.length}{" "}
            {tab === "roster" ? "students" : tab === "assignments" ? "assignments" : "materials"}
          </p>
        </div>
      )}
    </div>
  );
}
