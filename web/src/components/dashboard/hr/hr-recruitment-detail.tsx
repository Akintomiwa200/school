"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHrJob, useUpdateHrJob } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import type { HrJobDetail } from "@/lib/hr/map-hr-api";
import { AdminBackLink } from "../admin/admin-workflow-ui";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { HrDetailSkeleton, HrLiveBadge, HrNotFound } from "./hr-workflow-ui";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "interviewing", label: "Interviewing" },
  { value: "closed", label: "Closed" },
] as const;

export function HrRecruitmentDetail({ jobId }: { jobId: string }) {
  const pageLoading = usePageLoading();
  const { data: job, isFetching, isError, isFetched } = useHrJob<HrJobDetail | null>(jobId);
  const updateJob = useUpdateHrJob(jobId);
  const [statusDraft, setStatusDraft] = useState<HrJobDetail["status"] | "">("");

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <HrDetailSkeleton />;
  }

  if (isFetched && (isError || !job)) {
    return (
      <HrNotFound
        title="Job posting not found"
        description="This posting may have been removed or the link is invalid."
        backHref="/hr/recruitment"
        backLabel="Back to recruitment"
      />
    );
  }

  if (!job) return <HrDetailSkeleton />;

  const currentStatus = statusDraft || job.status;
  const screening = job.applications.filter((app) => app.status === "screening" || app.status === "applied").length;
  const interviewed = job.applications.filter((app) => app.status === "interview").length;

  const onSaveStatus = async () => {
    if (!currentStatus || currentStatus === job.status) return;
    await updateJob.mutateAsync({ status: currentStatus });
    setStatusDraft("");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/hr/recruitment" label="Back to recruitment" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{job.title}</h1>
            <HrLiveBadge isFetching={isFetching} updatedAt={job.updatedAt} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.department} · Posted {job.posted}
          </p>
          {job.description ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground/80">{job.description}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <select
            value={currentStatus}
            onChange={(e) => setStatusDraft(e.target.value as HrJobDetail["status"])}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={updateJob.isPending || currentStatus === job.status}
            onClick={() => void onSaveStatus()}
          >
            {updateJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update status"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Applicants" value={String(job.applicants)} tone="purple" />
        <ManagementStatCard label="In screening" value={String(screening)} tone="blue" />
        <ManagementStatCard label="Interview stage" value={String(interviewed)} tone="orange" />
        <ManagementStatCard label="Status" value={job.status} tone="green" />
      </div>

      <ManagementPanel className="overflow-hidden border border-border p-0">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">Applicant pipeline</h2>
          <p className="text-xs text-muted-foreground">{job.applications.length} candidates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {job.applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    No applicants yet for this posting.
                  </td>
                </tr>
              ) : (
                job.applications.map((app) => (
                  <tr key={app.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3.5 font-semibold">{app.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{app.email}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-blue">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ManagementPanel>
    </div>
  );
}
