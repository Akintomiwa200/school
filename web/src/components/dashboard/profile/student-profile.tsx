"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  CreditCard,
  Pencil,
  Receipt,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import {
  STUDENT_ACTIVITY_HOURS,
  STUDENT_LEARNING_SLICES,
  STUDENT_PAYMENT_HISTORY,
  STUDENT_PROFILE_METRICS,
  STUDENT_UPCOMING_TASKS,
} from "./profile-data";
import { ProfileAccountSections } from "./profile-account-sections";
import {
  ProfileMetricCard,
  ProfilePanel,
  ProfileSectionHeader,
  getProfileInitials,
} from "./profile-ui";

const METRIC_ICONS = {
  courses: BookOpen,
  lessons: Video,
  notifications: Bell,
  purchases: Receipt,
  balance: CreditCard,
} as const;

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-40 rounded-[20px] bg-muted" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 min-w-[120px] flex-1 rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-56 rounded-[20px] bg-muted" />
        <div className="h-56 rounded-[20px] bg-muted" />
        <div className="h-56 rounded-[20px] bg-muted" />
      </div>
    </div>
  );
}

function LearningDonut({ hours }: { hours: string }) {
  const slices = [
    { pct: 35, color: "#4f8cff" },
    { pct: 25, color: "#a855f7" },
    { pct: 20, color: "#f59e0b" },
    { pct: 20, color: "#22c55e" },
  ];
  let offset = 0;
  const r = 42;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative mx-auto h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        {slices.map((slice, index) => {
          const dash = (slice.pct / 100) * c;
          const el = (
            <circle
              key={index}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{hours}</span>
        <span className="text-[10px] text-muted-foreground">today</span>
      </div>
    </div>
  );
}

function ActivityChart() {
  const max = Math.max(...STUDENT_ACTIVITY_HOURS.map((item) => item.hours));
  const width = 560;
  const height = 160;
  const padding = 8;

  const points = STUDENT_ACTIVITY_HOURS.map((item, index) => {
    const x = padding + (index / (STUDENT_ACTIVITY_HOURS.length - 1)) * (width - padding * 2);
    const y = height - padding - (item.hours / max) * (height - padding * 2);
    return { x, y, ...item };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;
  const peak = points.reduce((best, p) => (p.hours > best.hours ? p : best), points[0]);

  return (
    <div className="relative mt-2 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 24}`} className="h-44 w-full min-w-[320px]">
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#activityFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <circle key={point.month} cx={point.x} cy={point.y} r="4" fill="#22c55e" />
        ))}
        {peak ? (
          <g>
            <rect x={peak.x - 28} y={peak.y - 28} width="56" height="20" rx="6" fill="#111827" />
            <text x={peak.x} y={peak.y - 14} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
              {peak.hours}h active
            </text>
          </g>
        ) : null}
        {points.map((point) => (
          <text
            key={`${point.month}-label`}
            x={point.x}
            y={height + 16}
            textAnchor="middle"
            fill="currentColor"
            className="fill-muted-foreground text-[10px]"
          >
            {point.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function StudentProfile() {
  const isLoading = usePageLoading();
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? "Alex Johnson";

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto min-w-0 w-full max-w-7xl">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl space-y-5">
      <ProfilePanel className="relative overflow-hidden border border-border bg-gradient-to-r from-[#2f6bff] via-brand-blue to-[#6aa8ff] p-0">
        <div className="relative z-10 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30 sm:h-24 sm:w-24">
            {session?.user?.image ? (
              <Image src={session.user.image} alt={displayName} fill className="object-cover" sizes="96px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {getProfileInitials(displayName)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 text-white">
            <h1 className="text-2xl font-bold sm:text-3xl">{displayName}</h1>
            <p className="mt-2 text-sm text-white/90">
              <span className="font-semibold">10</span> classes enrolled
              <span className="mx-2 text-white/50">|</span>
              <span className="font-semibold">10</span> teachers following
            </p>
            <Button
              asChild
              className="mt-4 h-10 rounded-full bg-green px-5 text-sm font-semibold text-white hover:bg-green/90"
            >
              <Link href="#personal-info" className="inline-flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 hidden pr-2 sm:block">
          <Image
            src="/boy-ui.png"
            alt=""
            width={200}
            height={200}
            className="h-36 w-auto -translate-y-4 object-contain object-bottom md:h-40"
          />
        </div>
      </ProfilePanel>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
        {STUDENT_PROFILE_METRICS.map((metric) => {
          const Icon = METRIC_ICONS[metric.id as keyof typeof METRIC_ICONS] ?? BookOpen;
          return <ProfileMetricCard key={metric.id} metric={metric} icon={Icon} />;
        })}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <ProfilePanel className="flex flex-col items-center border border-border text-center">
          <ProfileSectionHeader title="Points & badges" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow/20 text-brand-orange">
            <Trophy className="h-8 w-8" />
          </div>
          <p className="mt-4 text-3xl font-bold text-brand-purple">78.50</p>
          <p className="text-sm text-muted-foreground">Points</p>
          <p className="mt-3 text-sm font-medium">Top Science Student Badge</p>
          <Button className="mt-4 h-10 rounded-full bg-green px-5 text-white hover:bg-green/90">
            Next badge
          </Button>
        </ProfilePanel>

        <ProfilePanel className="border border-border">
          <ProfileSectionHeader
            title="Learning time"
            action={
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Today
              </span>
            }
          />
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <LearningDonut hours="2h" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <p className="text-sm font-semibold">WordPress Development</p>
              {STUDENT_LEARNING_SLICES.map((slice) => (
                <div key={slice.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{slice.label}</span>
                    <span className="font-medium">{slice.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${slice.percent}%`, backgroundColor: slice.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ProfilePanel>

        <ProfilePanel className="border border-border">
          <ProfileSectionHeader
            title="Upcoming tasks"
            action={
              <Link href="/student/assignments" className="text-xs font-semibold text-brand-purple hover:underline">
                See all
              </Link>
            }
          />
          <ul className="space-y-3">
            {STUDENT_UPCOMING_TASKS.map((task) => (
              <li key={task.id}>
                <Link
                  href={task.href}
                  className="flex items-start gap-3 rounded-2xl bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{task.time}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ProfilePanel>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
        <ProfilePanel className="border border-border">
          <ProfileSectionHeader
            title="My activity"
            action={
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Monthly
              </span>
            }
          />
          <ActivityChart />
        </ProfilePanel>

        <ProfilePanel className="border border-border">
          <ProfileSectionHeader
            title="Payment history"
            action={
              <Link href="/student/fees/payments" className="text-xs font-semibold text-brand-purple hover:underline">
                See all
              </Link>
            }
          />
          <ul className="space-y-3">
            {STUDENT_PAYMENT_HISTORY.map((payment) => (
              <li key={payment.id}>
                <div className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      payment.tone === "purple"
                        ? "bg-brand-purple/15 text-brand-purple"
                        : "bg-brand-blue/15 text-brand-blue",
                    )}
                  >
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{payment.title}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">{payment.amount}</p>
                </div>
              </li>
            ))}
          </ul>
        </ProfilePanel>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Account settings</h2>
          <Link href="/student/settings" className="inline-flex items-center gap-1 text-sm font-medium text-brand-purple hover:underline">
            Preferences
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ProfileAccountSections />
      </div>
    </div>
  );
}
