"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Briefcase, ChevronRight, Loader2, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateHrJobPosting, useHrData } from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass } from "../admin/admin-workflow-ui";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { HR_EMPTY } from "./hr-data";
import { HrListSkeleton, HrModal, HrPageHeader, hrInitialLoading } from "./hr-workflow-ui";

const JOB_CARD_STYLES = [
  "border-brand-purple/15 bg-brand-purple/5",
  "border-brand-blue/15 bg-brand-blue/5",
  "border-green/15 bg-green/5",
  "border-brand-orange/15 bg-brand-orange/5",
] as const;

const STATUS_BADGES = {
  open: "bg-brand-blue/10 text-brand-blue",
  interviewing: "bg-brand-orange/10 text-brand-orange",
  closed: "bg-muted text-muted-foreground",
} as const;

export function HrRecruitment() {
  const pageLoading = usePageLoading();
  const { data = HR_EMPTY, isFetching, isFetched } = useHrData(HR_EMPTY);
  const createJob = useCreateHrJobPosting();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const loading = hrInitialLoading(pageLoading, isFetching, isFetched);

  const stats = useMemo(() => ({
    total: data.recruitment.length,
    open: data.recruitment.filter((j) => j.status === "open").length,
    interviewing: data.recruitment.filter((j) => j.status === "interviewing").length,
    applicants: data.recruitment.reduce((sum, j) => sum + j.applicants, 0),
  }), [data.recruitment]);

  const filtered = useMemo(() => {
    let rows = data.recruitment;
    if (statusFilter) rows = rows.filter((job) => job.status === statusFilter);
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        (job.description ?? "").toLowerCase().includes(q),
    );
  }, [data.recruitment, search, statusFilter]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !department.trim()) return;
    await createJob.mutateAsync({ title, department, description });
    setTitle("");
    setDepartment("");
    setDescription("");
    setOpen(false);
  };

  if (loading) return <HrListSkeleton />;

  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Recruitment"
        description={stats.total > 0 ? `${stats.total} postings · ${stats.applicants} total applicants` : "Job postings and applicant pipeline."}
        isFetching={isFetching}
        updatedAt={data.updatedAt}
        action={
          <Button
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Post job
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard icon={Briefcase} label="Total postings" value={String(stats.total)} tone="purple" />
        <ManagementStatCard label="Open roles" value={String(stats.open)} hint="Accepting applicants" tone="blue" />
        <ManagementStatCard label="Interviewing" value={String(stats.interviewing)} tone="orange" />
        <ManagementStatCard icon={Users} label="Applicants" value={String(stats.applicants)} tone="green" />
      </div>

      <div className="dashboard-filter-bar" data-filter-bar="true">
        <div className="relative min-w-[12rem] flex-1 basis-[14rem]" data-search-field="true">
          <input
            type="text"
            placeholder="Search by title or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="box-border h-10 w-full min-w-0 max-w-full rounded-xl border border-border bg-card px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="interviewing">Interviewing</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <ManagementPanel className="border border-border py-14 text-center">
          <p className="text-sm font-medium text-muted-foreground">No job postings found</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {search ? "Try a different search term." : "Create your first posting to start receiving applicants."}
          </p>
          <Button
            className="mt-4 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Post job
          </Button>
        </ManagementPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job, index) => (
            <ManagementPanel
              key={job.id}
              className={cn("flex h-full flex-col border", JOB_CARD_STYLES[index % JOB_CARD_STYLES.length])}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{job.department}</p>
                  <Link href={`/hr/recruitment/${job.id}`} className="mt-1 block text-lg font-bold leading-snug hover:text-brand-purple">
                    {job.title}
                  </Link>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", STATUS_BADGES[job.status])}>
                  {job.status}
                </span>
              </div>
              {job.description ? (
                <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{job.description}</p>
              ) : (
                <div className="flex-1" />
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <span className="font-semibold tabular-nums">{job.applicants} applicants</span>
                <Link href={`/hr/recruitment/${job.id}`} className="inline-flex items-center gap-1 font-semibold text-brand-purple hover:underline">
                  View pipeline
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </ManagementPanel>
          ))}
        </div>
      )}

      <HrModal
        open={open}
        title="New job posting"
        description="Publish a role to the recruitment pipeline."
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <AdminFormField label="Job title">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Department">
            <input required value={department} onChange={(e) => setDepartment(e.target.value)} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(adminInputClass, "min-h-[96px] py-2")}
            />
          </AdminFormField>
          <Button
            type="submit"
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={createJob.isPending}
          >
            {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish posting"}
          </Button>
        </form>
      </HrModal>
    </div>
  );
}
