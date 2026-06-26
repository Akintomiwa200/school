"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Award,
  ClipboardCheck,
  CreditCard,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useParentAttendance,
  useParentDashboard,
  useParentFees,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../fees/fee-ui";
import {
  ManagementActionLink,
  ManagementPageHeader,
  ManagementPanel,
  ManagementStatCard,
} from "../management/management-ui";
import {
  ATTENDANCE_STATUS_STYLES,
  FEE_STATUS_STYLES,
  PARENT_ATTENDANCE_ALERTS,
  PARENT_ATTENDANCE_RECORDS,
  PARENT_CHILDREN,
  PARENT_DASHBOARD_STATS,
  PARENT_FEE_ITEMS,
  getParentFeeSummary,
  type ParentAttendanceAlert,
  type ParentAttendanceRecord,
  type ParentChild,
  type ParentFeeItem,
} from "./parent-data";

type ParentDashboardPayload = {
  children: ParentChild[];
  feeItems: ParentFeeItem[];
  attendanceRecords: ParentAttendanceRecord[];
  alerts: ParentAttendanceAlert[];
  stats: typeof PARENT_DASHBOARD_STATS;
  feeSummary: ReturnType<typeof getParentFeeSummary>;
};

const PARENT_FALLBACK: ParentDashboardPayload = {
  children: PARENT_CHILDREN,
  feeItems: PARENT_FEE_ITEMS,
  attendanceRecords: PARENT_ATTENDANCE_RECORDS,
  alerts: PARENT_ATTENDANCE_ALERTS,
  stats: PARENT_DASHBOARD_STATS,
  feeSummary: getParentFeeSummary(),
};

type ParentAttendancePayload = {
  records: ParentAttendanceRecord[];
  alerts: ParentAttendanceAlert[];
};

const PARENT_ATTENDANCE_FALLBACK: ParentAttendancePayload = {
  records: PARENT_ATTENDANCE_RECORDS,
  alerts: PARENT_ATTENDANCE_ALERTS,
};

const SK = <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

const AVATAR_TONES = {
  purple: "bg-brand-purple/15 text-brand-purple",
  blue: "bg-brand-blue/15 text-brand-blue",
  green: "bg-green/15 text-green",
};

export function ParentDashboard() {
  const { data = PARENT_FALLBACK, isFetching } = useParentDashboard(PARENT_FALLBACK);
  const loading = usePageLoading(400) || isFetching;
  if (loading) return SK;

  const { children, alerts, stats, feeSummary } = data;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Parent dashboard"
        description="Follow your children's progress, fees, and attendance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <ManagementStatCard key={s.id} {...s} value={s.id === "fees" ? formatCurrency(feeSummary.outstanding) : s.value} />
        ))}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <ManagementPanel className="border border-border lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">Your children</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((child) => (
              <div key={child.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold", AVATAR_TONES[child.avatarTone])}>
                    {child.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-xs text-muted-foreground">Grade {child.grade} · {child.className}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                    <p className="font-bold">{child.attendanceRate}%</p>
                    <p className="text-muted-foreground">Attendance</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                    <p className="font-bold">{child.gpa}</p>
                    <p className="text-muted-foreground">GPA</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                    <p className={cn("font-bold", child.feesOutstanding > 0 ? "text-brand-orange" : "text-green")}>
                      {child.feesOutstanding > 0 ? formatCurrency(child.feesOutstanding) : "Paid"}
                    </p>
                    <p className="text-muted-foreground">Fees</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Quick links</h2>
          <div className="mt-4 space-y-2">
            <ManagementActionLink href="/parent/children" label="My children" description="Profiles and details" icon={Users} />
            <ManagementActionLink href="/parent/fees" label="Pay fees" description="Outstanding balances" icon={CreditCard} />
            <ManagementActionLink href="/parent/grades" label="Grades" description="Report cards & GPA" icon={Award} />
            <ManagementActionLink href="/parent/messages" label="Messages" description="Contact teachers" icon={MessageSquare} />
          </div>
          {unreadAlerts > 0 ? (
            <p className="mt-4 rounded-xl bg-brand-orange/10 px-3 py-2 text-xs font-medium text-brand-orange">
              {unreadAlerts} attendance alert{unreadAlerts > 1 ? "s" : ""} need your attention
            </p>
          ) : null}
        </ManagementPanel>
      </div>
    </div>
  );
}

export function ParentChildren() {
  const { data = PARENT_FALLBACK, isFetching } = useParentDashboard(PARENT_FALLBACK);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;

  const { children } = data;

  return (
    <div className="space-y-6">
      <ManagementPageHeader title="My children" description="Profiles and quick links for each child." />
      <div className="space-y-4">
        {children.map((child) => (
          <ManagementPanel key={child.id} className="border border-border">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold", AVATAR_TONES[child.avatarTone])}>
                  {child.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">{child.studentId} · Grade {child.grade} · {child.className}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    <div><dt className="text-xs text-muted-foreground">Attendance</dt><dd className="font-semibold">{child.attendanceRate}%</dd></div>
                    <div><dt className="text-xs text-muted-foreground">GPA</dt><dd className="font-semibold">{child.gpa}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Fees due</dt><dd className={cn("font-semibold", child.feesOutstanding > 0 ? "text-brand-orange" : "text-green")}>{child.feesOutstanding > 0 ? formatCurrency(child.feesOutstanding) : "None"}</dd></div>
                  </dl>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full"><Link href="/parent/grades">Grades</Link></Button>
                <Button asChild variant="outline" size="sm" className="rounded-full"><Link href="/parent/attendance">Attendance</Link></Button>
                <Button asChild size="sm" className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Link href="/parent/fees">Fees</Link></Button>
              </div>
            </div>
          </ManagementPanel>
        ))}
      </div>

      <ManagementPanel className="border border-border">
        <h2 className="text-base font-bold">Guardian information</h2>
        <p className="mt-1 text-sm text-muted-foreground">Contact details on file for school communications.</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/40 px-4 py-3"><dt className="text-xs text-muted-foreground">Primary guardian</dt><dd className="mt-1 font-semibold">Maria Johnson</dd></div>
          <div className="rounded-xl bg-muted/40 px-4 py-3"><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 font-semibold">maria.johnson@email.com</dd></div>
          <div className="rounded-xl bg-muted/40 px-4 py-3"><dt className="text-xs text-muted-foreground">Phone</dt><dd className="mt-1 font-semibold">+234 801 234 5678</dd></div>
          <div className="rounded-xl bg-muted/40 px-4 py-3"><dt className="text-xs text-muted-foreground">Emergency contact</dt><dd className="mt-1 font-semibold">Lee Wilson · +234 802 345 6789</dd></div>
        </dl>
        <Button variant="outline" className="mt-4 rounded-full">Update contact details</Button>
      </ManagementPanel>
    </div>
  );
}

export function ParentFees() {
  const { data: feeItems = PARENT_FEE_ITEMS, isFetching: feesFetching } = useParentFees(PARENT_FEE_ITEMS);
  const { data: parentData = PARENT_FALLBACK, isFetching: parentFetching } = useParentDashboard(PARENT_FALLBACK);
  const loading = usePageLoading() || feesFetching || parentFetching;
  const [childFilter, setChildFilter] = useState<"all" | string>("all");
  const summary = parentData.feeSummary;

  const filtered = useMemo(() => {
    if (childFilter === "all") return feeItems;
    return feeItems.filter((i) => i.childId === childFilter);
  }, [feeItems, childFilter]);

  if (loading) return SK;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Fees & payments"
        description="Pay school fees and download receipts for your children."
        action={
          <Button className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay outstanding
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ManagementPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total outstanding</p>
          <p className="mt-2 text-2xl font-bold text-brand-orange">{formatCurrency(summary.outstanding)}</p>
        </ManagementPanel>
        <ManagementPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Overdue items</p>
          <p className="mt-2 text-2xl font-bold text-destructive">{summary.overdue}</p>
        </ManagementPanel>
        <ManagementPanel className="border border-border">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children with balance</p>
          <p className="mt-2 text-2xl font-bold">{summary.childrenWithBalance}</p>
        </ManagementPanel>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setChildFilter("all")} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", childFilter === "all" ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground")}>All children</button>
        {parentData.children.map((c) => (
          <button key={c.id} type="button" onClick={() => setChildFilter(c.id)} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", childFilter === c.id ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground hover:text-foreground")}>{c.name.split(" ")[0]}</button>
        ))}
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Child</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{item.childName}</td>
                <td className="px-4 py-3">{item.label}</td>
                <td className="px-4 py-3 font-semibold text-brand-orange">{formatCurrency(item.amount - item.paidAmount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", FEE_STATUS_STYLES[item.status])}>{item.status}</span>
                </td>
                <td className="px-4 py-3">
                  {item.amount > item.paidAmount ? (
                    <Button size="sm" className="h-8 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">Pay</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 rounded-full">Receipt</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}

export function ParentAttendance() {
  const { data = PARENT_ATTENDANCE_FALLBACK, isFetching: attendanceFetching } =
    useParentAttendance<ParentAttendancePayload>(PARENT_ATTENDANCE_FALLBACK);
  const { data: parentData = PARENT_FALLBACK, isFetching: parentFetching } = useParentDashboard(PARENT_FALLBACK);
  const loading = usePageLoading() || attendanceFetching || parentFetching;
  const [childFilter, setChildFilter] = useState<"all" | string>("all");

  const { records, alerts } = data;

  const filtered = useMemo(() => {
    if (childFilter === "all") return records;
    return records.filter((r) => r.childId === childFilter);
  }, [records, childFilter]);

  if (loading) return SK;

  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Attendance" description="Attendance records and alerts for your children." />

      <div className="grid gap-4 sm:grid-cols-2">
        {parentData.children.map((child) => {
          const childRecords = records.filter((r) => r.childId === child.id);
          const present = childRecords.filter((r) => r.status === "present" || r.status === "late").length;
          const absent = childRecords.filter((r) => r.status === "absent").length;
          const late = childRecords.filter((r) => r.status === "late").length;
          return (
            <ManagementPanel key={child.id} className="border border-border">
              <h3 className="font-bold">{child.name}</h3>
              <p className="text-sm text-muted-foreground">Grade {child.grade} · {child.className}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-green/10 px-2 py-2"><p className="font-bold text-green">{present}</p><p className="text-xs text-muted-foreground">Present</p></div>
                <div className="rounded-xl bg-destructive/10 px-2 py-2"><p className="font-bold text-destructive">{absent}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                <div className="rounded-xl bg-brand-orange/10 px-2 py-2"><p className="font-bold text-brand-orange">{late}</p><p className="text-xs text-muted-foreground">Late</p></div>
              </div>
            </ManagementPanel>
          );
        })}
      </div>

      {alerts.length > 0 ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Alerts</h2>
          <ul className="mt-3 space-y-2">
            {alerts.map((alert) => (
              <li key={alert.id} className={cn("rounded-xl px-3 py-2.5 text-sm", alert.read ? "bg-muted/40" : "bg-brand-orange/10")}>
                <p className="font-semibold">{alert.childName}</p>
                <p className="text-muted-foreground">{alert.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{alert.date}</p>
              </li>
            ))}
          </ul>
        </ManagementPanel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setChildFilter("all")} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", childFilter === "all" ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground")}>All</button>
        {parentData.children.map((c) => (
          <button key={c.id} type="button" onClick={() => setChildFilter(c.id)} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", childFilter === c.id ? "bg-brand-purple text-white" : "bg-muted text-muted-foreground")}>{c.name.split(" ")[0]}</button>
        ))}
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Child</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{r.childName}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", ATTENDANCE_STATUS_STYLES[r.status])}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.subject ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
