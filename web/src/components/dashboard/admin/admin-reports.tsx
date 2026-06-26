"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AVATAR_TONES } from "./admin-data";
import {
  ADMIN_REPORT_METRICS,
  COLLECTION_COMPARISON,
  ENROLLMENT_TREND,
  FEATURED_STUDENT,
  FEE_BREAKDOWN,
  formatReportChange,
  formatReportLastRun,
  parseReportFormats,
  REVENUE_BY_CATEGORY,
  STANDARD_REPORTS,
  TOP_ENROLLMENT_LOCATIONS,
  totalFeeBreakdown,
  type ReportPeriod,
  type StandardReport,
  type StandardReportCategory,
} from "./admin-reports-data";

const METRIC_TONES = {
  pink: "bg-gradient-to-br from-pink-500 to-rose-600 text-white",
  teal: "bg-gradient-to-br from-teal-500 to-emerald-600 text-white",
  blue: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
  cyan: "bg-gradient-to-br from-cyan-500 to-sky-600 text-white",
  purple: "bg-gradient-to-br from-violet-500 to-purple-700 text-white",
  orange: "bg-gradient-to-br from-orange-500 to-amber-600 text-white",
} as const;

const PERIOD_OPTIONS: ReportPeriod[] = ["Daily", "Weekly", "Monthly", "Yearly"];

const REPORT_CATEGORY_LABELS: Record<StandardReportCategory, string> = {
  students: "Students",
  staff: "Staff",
  operations: "Operations",
  finance: "Finance",
  admissions: "Admissions",
};

const REPORT_TONE_STYLES = {
  purple: {
    card: "border-l-brand-purple",
    icon: "bg-brand-purple/15 text-brand-purple",
    badge: "bg-brand-purple/10 text-brand-purple",
  },
  blue: {
    card: "border-l-brand-blue",
    icon: "bg-brand-blue/15 text-brand-blue",
    badge: "bg-brand-blue/10 text-brand-blue",
  },
  green: {
    card: "border-l-green",
    icon: "bg-green/15 text-green",
    badge: "bg-green/10 text-green",
  },
  orange: {
    card: "border-l-brand-orange",
    icon: "bg-brand-orange/15 text-brand-orange",
    badge: "bg-brand-orange/10 text-brand-orange",
  },
  teal: {
    card: "border-l-teal-600",
    icon: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  },
} as const;

const REPORT_ICONS: Record<StandardReportCategory, React.ComponentType<{ className?: string }>> = {
  students: GraduationCap,
  staff: Users,
  operations: ClipboardList,
  finance: Wallet,
  admissions: FileText,
};

function FormatBadge({ format }: { format: string }) {
  const isPdf = format.toUpperCase().includes("PDF");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        isPdf ? "bg-destructive/10 text-destructive" : "bg-green/10 text-green",
      )}
    >
      {isPdf ? <FileText className="h-3 w-3" /> : <FileSpreadsheet className="h-3 w-3" />}
      {format}
    </span>
  );
}

function StandardReportCard({
  report,
  generating,
  onGenerate,
}: {
  report: StandardReport;
  generating: boolean;
  onGenerate: (format: string) => void;
}) {
  const styles = REPORT_TONE_STYLES[report.tone];
  const Icon = REPORT_ICONS[report.category];
  const formats = parseReportFormats(report.format);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] border border-border border-l-[4px] bg-card shadow-float transition-shadow hover:shadow-lg",
        styles.card,
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", styles.badge)}>
                {REPORT_CATEGORY_LABELS[report.category]}
              </span>
              {formats.map((fmt) => (
                <FormatBadge key={fmt} format={fmt} />
              ))}
            </div>
            <h3 className="mt-2 text-base font-bold text-foreground">{report.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            {report.recordsLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Last run {formatReportLastRun(report.lastRun)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 p-4">
        <Button variant="outline" size="sm" className="h-9 flex-1 rounded-xl sm:flex-none sm:px-4">
          <Eye className="mr-2 h-3.5 w-3.5" />
          Preview
        </Button>
        {formats.length === 1 ? (
          <Button
            size="sm"
            disabled={generating}
            onClick={() => onGenerate(formats[0])}
            className="h-9 flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none sm:px-5"
          >
            {generating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
            Generate {formats[0]}
          </Button>
        ) : (
          formats.map((fmt) => (
            <Button
              key={fmt}
              size="sm"
              disabled={generating}
              onClick={() => onGenerate(fmt)}
              className="h-9 flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none sm:px-4"
            >
              {generating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
              {fmt}
            </Button>
          ))
        )}
      </div>
    </article>
  );
}

function ReportsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-full max-w-md rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-80 rounded-[20px] bg-muted lg:col-span-7" />
        <div className="h-80 rounded-[20px] bg-muted lg:col-span-5" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 rounded-[20px] bg-muted lg:col-span-3" />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, tone }: (typeof ADMIN_REPORT_METRICS)[number]) {
  const positive = change >= 0;
  return (
    <div className={cn("rounded-[20px] p-4 shadow-float", METRIC_TONES[tone])}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-90">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs font-semibold opacity-95">
        {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {formatReportChange(change)}
      </p>
    </div>
  );
}

function PeriodTabs({ value, onChange }: { value: ReportPeriod; onChange: (v: ReportPeriod) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
      {PERIOD_OPTIONS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            value === period ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
}

function DonutCenter({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <p className="text-lg font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">Total fees</p>
    </div>
  );
}

export function AdminReports() {
  const loading = usePageLoading(400);
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2026-06-30");
  const [enrollmentPeriod, setEnrollmentPeriod] = useState<ReportPeriod>("Monthly");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const enrollmentData = useMemo(() => ENROLLMENT_TREND[enrollmentPeriod], [enrollmentPeriod]);

  const handleGenerate = (reportId: string) => {
    setGeneratingId(reportId);
    window.setTimeout(() => setGeneratingId(null), 1200);
  };

  if (loading) return <ReportsSkeleton />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Reports"
        description="Analytics on enrollment, fees, attendance, and school operations."
      />

      <ManagementPanel className="border border-border">
        <p className="mb-3 text-sm font-semibold text-foreground">Filter by date</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Button variant="outline" className="h-10 rounded-xl px-4">
            Apply filter
          </Button>
        </div>
      </ManagementPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {ADMIN_REPORT_METRICS.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <ManagementPanel className="border border-border lg:col-span-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-foreground">Enrollment figure</h2>
            <PeriodTabs value={enrollmentPeriod} onChange={setEnrollmentPeriod} />
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#f59e0b" }}
                  name="Enrollments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border lg:col-span-5">
          <h2 className="mb-4 text-base font-bold text-foreground">Fee collection report</h2>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COLLECTION_COMPARISON} barGap={4} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="online" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Online" />
                <Bar dataKey="offline" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Offline" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
              Online payments
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              Offline / cash
            </span>
          </div>
        </ManagementPanel>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold text-foreground">Star student</h2>
          <div className="mt-4 flex flex-col items-center text-center">
            <span
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-2xl text-lg font-bold",
                AVATAR_TONES[FEATURED_STUDENT.avatarTone],
              )}
            >
              EH
            </span>
            <p className="mt-3 font-bold text-foreground">{FEATURED_STUDENT.name}</p>
            <p className="text-sm text-muted-foreground">{FEATURED_STUDENT.grade}</p>
            <dl className="mt-4 w-full space-y-2 text-left text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Attendance</dt>
                <dd className="font-semibold">{FEATURED_STUDENT.attendance}%</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Average score</dt>
                <dd className="font-semibold text-primary">{FEATURED_STUDENT.averageScore}%</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Fees</dt>
                <dd className="font-semibold text-green">{FEATURED_STUDENT.feeStatus}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-4 w-full rounded-full">
              <Link href="/admin/students">View profile</Link>
            </Button>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Top enrollment areas</h2>
          </div>
          <div className="mb-4 rounded-xl bg-muted/50 p-3">
            <div className="flex h-24 items-end justify-between gap-1">
              {TOP_ENROLLMENT_LOCATIONS.map((item) => (
                <div key={item.region} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-primary/70"
                    style={{ height: `${Math.max(24, item.share * 3)}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{item.share}%</span>
                </div>
              ))}
            </div>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 font-medium">Region</th>
                <th className="pb-2 font-medium">Students</th>
                <th className="pb-2 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {TOP_ENROLLMENT_LOCATIONS.map((item) => (
                <tr key={item.region} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium">{item.region}</td>
                  <td className="py-2 tabular-nums">{item.students}</td>
                  <td className="py-2 tabular-nums text-muted-foreground">{item.share}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="mb-4 text-base font-bold text-foreground">Total fees</h2>
          <div className="relative mx-auto h-44 w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FEE_BREAKDOWN}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {FEE_BREAKDOWN.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <DonutCenter label={totalFeeBreakdown()} />
          </div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {FEE_BREAKDOWN.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold tabular-nums">{item.value}%</span>
              </li>
            ))}
          </ul>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Revenue streams</h2>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_BY_CATEGORY}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={64}
                  stroke="none"
                >
                  {REVENUE_BY_CATEGORY.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2">
            {REVENUE_BY_CATEGORY.map((item) => (
              <li key={item.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold tabular-nums">{item.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </ManagementPanel>
      </div>

      <ManagementPanel className="border border-border">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Standard reports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate PDF or CSV exports for enrollment, staff, attendance, admissions, and fees.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {STANDARD_REPORTS.length} templates
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {STANDARD_REPORTS.map((report) => (
            <StandardReportCard
              key={report.id}
              report={report}
              generating={generatingId === report.id}
              onGenerate={() => handleGenerate(report.id)}
            />
          ))}
        </div>
      </ManagementPanel>
    </div>
  );
}
