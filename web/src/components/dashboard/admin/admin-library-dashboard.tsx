"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Book,
  BookMarked,
  Bookmark,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useLibraryData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import {
  LIBRARIAN_BOOKS,
  LIBRARIAN_ISSUES,
  LIBRARY_STATUS_STYLES,
  libraryPaths,
} from "../librarian/librarian-data";
import { AVATAR_TONES } from "./admin-data";
import {
  BOOK_COVER_TONES,
  buildLibraryActivity,
  buildPopularIssuedBooks,
  buildTopAuthors,
  formatLibraryDate,
  LIBRARY_MEMBER_BASELINE,
  LIBRARY_RESERVED_COUNT,
  LIBRARY_REVENUE_MONTHLY,
  LIBRARY_USES_WEEKLY,
} from "./admin-library-data";

const BASE = "/admin/library";

const FALLBACK = {
  books: LIBRARIAN_BOOKS,
  issues: LIBRARIAN_ISSUES,
  stats: {
    totalBooks: LIBRARIAN_BOOKS.reduce((s, b) => s + b.copies, 0),
    catalogTitles: LIBRARIAN_BOOKS.length,
    issued: LIBRARIAN_ISSUES.filter((i) => i.status !== "returned").length,
    overdue: LIBRARIAN_ISSUES.filter((i) => i.status === "overdue").length,
    available: LIBRARIAN_BOOKS.reduce((s, b) => s + b.available, 0),
  },
};

const STAT_TONES = {
  purple: {
    border: "border-b-brand-purple",
    icon: "bg-brand-purple/15 text-brand-purple",
  },
  green: {
    border: "border-b-green",
    icon: "bg-green/15 text-green",
  },
  blue: {
    border: "border-b-brand-blue",
    icon: "bg-brand-blue/15 text-brand-blue",
  },
  orange: {
    border: "border-b-brand-orange",
    icon: "bg-brand-orange/15 text-brand-orange",
  },
  red: {
    border: "border-b-destructive",
    icon: "bg-destructive/15 text-destructive",
  },
} as const;

function PeriodSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">Period</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 appearance-none rounded-lg border border-border bg-background pl-2.5 pr-7 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}

function LibraryStatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: keyof typeof STAT_TONES;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const styles = STAT_TONES[tone];
  return (
    <ManagementPanel
      className={cn("border border-border border-b-[3px] bg-card p-4 shadow-float", styles.border)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </ManagementPanel>
  );
}

function BookCover({ title, tone }: { title: string; tone: keyof typeof BOOK_COVER_TONES }) {
  return (
    <span
      className={cn(
        "flex h-11 w-9 shrink-0 items-center justify-center rounded-md text-[9px] font-bold leading-none",
        BOOK_COVER_TONES[tone],
      )}
    >
      {title
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}

function MemberAvatar({
  name,
  tone,
}: {
  name: string;
  tone: keyof typeof AVATAR_TONES | "pink";
}) {
  const toneClass =
    tone === "pink" ? "bg-brand-pink/15 text-brand-pink" : AVATAR_TONES[tone];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        toneClass,
      )}
    >
      {initials}
    </span>
  );
}

function PanelHeader({
  title,
  period,
  periodOptions,
  onPeriodChange,
  href,
}: {
  title: string;
  period: string;
  periodOptions: string[];
  onPeriodChange: (v: string) => void;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="flex items-center gap-2">
        <PeriodSelect value={period} options={periodOptions} onChange={onPeriodChange} />
        {href ? (
          <Link href={href} className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="h-72 rounded-[20px] bg-muted xl:col-span-5" />
        <div className="h-72 rounded-[20px] bg-muted xl:col-span-4" />
        <div className="h-72 rounded-[20px] bg-muted xl:col-span-3" />
      </div>
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="h-96 rounded-[20px] bg-muted xl:col-span-8" />
        <div className="h-96 rounded-[20px] bg-muted xl:col-span-4" />
      </div>
    </div>
  );
}

function activityStatusLabel(status: "active" | "overdue" | "returned") {
  if (status === "returned") return "Returned";
  if (status === "overdue") return "Due";
  return "Issued";
}

function activityStatusClass(status: "active" | "overdue" | "returned") {
  if (status === "returned") return "bg-green/15 text-green";
  if (status === "overdue") return "bg-destructive/15 text-destructive";
  return LIBRARY_STATUS_STYLES.active;
}

export function AdminLibraryDashboard() {
  const paths = libraryPaths(BASE);
  const loading = usePageLoading(400);
  const { data = FALLBACK } = useLibraryData(FALLBACK);

  const [usesPeriod, setUsesPeriod] = useState("Last week");
  const [revenuePeriod, setRevenuePeriod] = useState("Last 6 Months");
  const [issuedPeriod, setIssuedPeriod] = useState("This month");
  const [activityPeriod, setActivityPeriod] = useState("Last Month");
  const [authorsPeriod, setAuthorsPeriod] = useState("This month");

  const stats = data.stats ?? FALLBACK.stats;
  const memberCount = useMemo(() => {
    const unique = new Set(data.issues.map((i) => i.borrowerId)).size;
    return Math.max(LIBRARY_MEMBER_BASELINE, unique);
  }, [data.issues]);

  const popularIssued = useMemo(
    () => buildPopularIssuedBooks(data.books, data.issues),
    [data.books, data.issues],
  );
  const topAuthors = useMemo(
    () => buildTopAuthors(data.books, data.issues),
    [data.books, data.issues],
  );
  const activity = useMemo(
    () => buildLibraryActivity(data.books, data.issues),
    [data.books, data.issues],
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <LibraryStatCard label="Total Books" value={String(stats.totalBooks)} tone="purple" icon={Book} />
        <LibraryStatCard label="Total Members" value={String(memberCount)} tone="green" icon={Users} />
        <LibraryStatCard label="Issued Books" value={String(stats.issued)} tone="blue" icon={BookMarked} />
        <LibraryStatCard label="Reserved Books" value={String(LIBRARY_RESERVED_COUNT)} tone="orange" icon={Bookmark} />
        <LibraryStatCard label="Overdue Books" value={String(stats.overdue)} tone="red" icon={AlertCircle} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <ManagementPanel className="border border-border xl:col-span-5">
          <PanelHeader
            title="Library Uses"
            period={usesPeriod}
            periodOptions={["Last week", "Last month"]}
            onPeriodChange={setUsesPeriod}
          />
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...LIBRARY_USES_WEEKLY]} barGap={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="members" name="Members" fill="hsl(var(--brand-purple))" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="issued" name="Issued" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-purple" />
              Members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              Issued
            </span>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border xl:col-span-4">
          <PanelHeader
            title="Revenue"
            period={revenuePeriod}
            periodOptions={["Last 6 Months", "This year"]}
            onPeriodChange={setRevenuePeriod}
          />
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...LIBRARY_REVENUE_MONTHLY]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="libraryRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#libraryRevenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border xl:col-span-3">
          <PanelHeader
            title="Issued Books"
            period={issuedPeriod}
            periodOptions={["This month", "Last month"]}
            onPeriodChange={setIssuedPeriod}
            href={paths.issues}
          />
          <ul className="space-y-3">
            {popularIssued.length === 0 ? (
              <li className="text-sm text-muted-foreground">No issue history yet.</li>
            ) : (
              popularIssued.map((item) => (
                <li key={item.id}>
                  <Link
                    href={paths.book(item.id)}
                    className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-muted/40"
                  >
                    <BookCover title={item.title} tone={item.coverTone} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Book ID: {item.bookId} · Issued {item.timesIssued} times
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </ManagementPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <ManagementPanel className="border border-border p-0 xl:col-span-8">
          <div className="border-b border-border p-4 sm:p-5">
            <PanelHeader
              title="Library Activity"
              period={activityPeriod}
              periodOptions={["Last Month", "Last 3 months"]}
              onPeriodChange={setActivityPeriod}
              href={paths.issues}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Books</th>
                  <th className="px-4 py-3 font-medium">Members Info</th>
                  <th className="px-4 py-3 font-medium">Issue &amp; Due Date</th>
                  <th className="px-4 py-3 font-medium">Return Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link href={paths.issue(row.id)} className="flex items-center gap-3 hover:underline">
                        <BookCover title={row.title} tone={row.coverTone} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{row.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{row.author}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar name={row.borrower} tone={row.avatarTone} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{row.borrower}</p>
                          <p className="text-xs text-muted-foreground">{row.borrowerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{formatLibraryDate(row.issuedDate)}</p>
                      <p className="text-xs">{formatLibraryDate(row.dueDate)}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.returnedDate ? formatLibraryDate(row.returnedDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          activityStatusClass(row.status),
                        )}
                      >
                        {activityStatusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border xl:col-span-4">
          <PanelHeader
            title="Top Author"
            period={authorsPeriod}
            periodOptions={["This month", "This year"]}
            onPeriodChange={setAuthorsPeriod}
            href={paths.books}
          />
          <ul className="space-y-4">
            {topAuthors.map((author, index) => (
              <li key={author.id} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <MemberAvatar name={author.name} tone={author.avatarTone} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {author.books} books · {author.issues} issues
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ManagementPanel>
      </div>
    </div>
  );
}
