"use client";

import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useHrData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementActionLink, ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { HR_DASHBOARD_STATS, HR_EMPLOYEES, HR_LEAVE_REQUESTS, HR_RECRUITMENT } from "./hr-data";
import { Briefcase, CalendarOff, Users } from "lucide-react";

const SK = <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

const HR_FALLBACK = {
  stats: HR_DASHBOARD_STATS,
  employees: HR_EMPLOYEES,
  leaveRequests: HR_LEAVE_REQUESTS,
  recruitment: HR_RECRUITMENT,
};

export function HrDashboard() {
  const loading = usePageLoading(400);
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="HR overview" description="Employees, leave, and recruitment at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{HR_DASHBOARD_STATS.map((s) => <ManagementStatCard key={s.id} {...s} />)}</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ManagementActionLink href="/hr/employees" label="Employees" description="Directory and documents" icon={Users} />
        <ManagementActionLink href="/hr/leave" label="Leave" description="Approve requests" icon={CalendarOff} />
        <ManagementActionLink href="/hr/recruitment" label="Recruitment" description="Open positions" icon={Briefcase} />
      </div>
    </div>
  );
}

export function HrEmployees() {
  const { data = HR_FALLBACK, isFetching } = useHrData(HR_FALLBACK);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Employees" description="HR records for all school employees." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Add employee</Button>} />
      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Contract</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>{data.employees.map((e) => (
            <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3"><p className="font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.employeeId}</p></td>
              <td className="px-4 py-3">{e.department}</td><td className="px-4 py-3">{e.contract}</td><td className="px-4 py-3 text-muted-foreground">{e.startDate}</td>
              <td className="px-4 py-3"><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", e.status === "active" ? "bg-green/15 text-green" : "bg-brand-orange/15 text-brand-orange")}>{e.status.replace("_", " ")}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}

export function HrLeave() {
  const { data = HR_FALLBACK, isFetching } = useHrData(HR_FALLBACK);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Leave management" description="Approve and track staff leave requests." />
      <div className="space-y-3">{data.leaveRequests.map((r) => (
        <ManagementPanel key={r.id} className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold">{r.employee}</h3><p className="text-sm text-muted-foreground">{r.type} · {r.from} → {r.to} ({r.days} days)</p></div>
          {r.status === "pending" ? <div className="flex gap-2"><Button size="sm" className="rounded-full bg-green text-white"><Check className="mr-1 h-3.5 w-3.5" />Approve</Button><Button size="sm" variant="outline" className="rounded-full"><X className="mr-1 h-3.5 w-3.5" />Reject</Button></div> : <span className="rounded-full bg-green/15 px-3 py-1 text-xs font-semibold text-green capitalize">{r.status}</span>}
        </ManagementPanel>
      ))}</div>
    </div>
  );
}

export function HrRecruitment() {
  const { data = HR_FALLBACK, isFetching } = useHrData(HR_FALLBACK);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Recruitment" description="Job postings and applicant pipeline." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Post job</Button>} />
      <div className="grid gap-4 lg:grid-cols-2">{data.recruitment.map((j) => (
        <ManagementPanel key={j.id} className="border border-border">
          <h3 className="font-bold">{j.title}</h3><p className="text-sm text-muted-foreground">{j.department} · Posted {j.posted}</p>
          <div className="mt-4 flex items-center justify-between"><span className="text-sm font-semibold">{j.applicants} applicants</span><span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", j.status === "open" ? "bg-brand-blue/15 text-brand-blue" : "bg-brand-orange/15 text-brand-orange")}>{j.status}</span></div>
          <Button variant="outline" className="mt-4 w-full rounded-full">View applicants</Button>
        </ManagementPanel>
      ))}</div>
    </div>
  );
}
