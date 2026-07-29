"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAdmissionConfig, useUpdateAdmissionConfig } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  buildAdmissionsPublicSteps,
  buildAdmissionsRequirements,
  createDefaultAdmissionConfig,
  formatAdmissionFee,
  SCHOOL_TYPE_LABELS,
  type AdmissionConfig,
  type SchoolType,
} from "@/components/admissions/admissions-workflow-data";
import { useAdmissionsLiveStore } from "@/components/admissions/admissions-live-store";
import { AdminBackLink, AdminFormField } from "../admin/admin-workflow-ui";
import {
  dashboardFieldClass,
  dashboardMonoTextareaClass,
  dashboardTextareaClass,
} from "../form-controls";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { SuperAdminListSkeleton, superAdminInitialLoading } from "./super-admin-workflow-ui";

const FALLBACK = createDefaultAdmissionConfig("university");

const PROCESS_STEPS = [
  { id: "institution", label: "Institution", icon: Building2 },
  { id: "programs", label: "Programs", icon: GraduationCap },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "exam", label: "Examination", icon: BookOpen },
  { id: "fees", label: "Fees", icon: Wallet },
  { id: "public", label: "Public page", icon: Globe },
  { id: "review", label: "Review", icon: CheckCircle2 },
] as const;

type SectionId = (typeof PROCESS_STEPS)[number]["id"];

const SCHOOL_TYPE_HINTS: Record<SchoolType, string> = {
  primary: "Nursery through Primary 6",
  secondary: "Grades 6–12 with guardian verification",
  university: "JAMB, O'Level, Post-UTME style",
  college: "ND/HND and technical programs",
};

function AdmissionsLiveBadge({ isFetching }: { isFetching?: boolean }) {
  const { connection, lastSyncedAt } = useAdmissionsLiveStore();
  const timeLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connection === "error" ? "bg-brand-orange" : "bg-green",
          (isFetching || connection === "connecting" || connection === "reconnecting") && "animate-pulse",
          connection === "idle" && "opacity-40",
        )}
      />
      {connection === "error" ? "Reconnecting" : connection === "idle" ? "Offline" : "Live sync"}
      {timeLabel ? <span className="text-muted-foreground/70">· {timeLabel}</span> : null}
    </span>
  );
}

function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-background/60 p-4 transition-colors hover:bg-muted/30">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span> : null}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className={cn("block h-6 w-11 rounded-full transition-colors", checked ? "bg-brand-purple" : "bg-muted")} />
        <span className={cn("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </span>
    </label>
  );
}

function ProcessPipeline({ active }: { active: SectionId }) {
  const activeIndex = PROCESS_STEPS.findIndex((s) => s.id === active);
  return (
    <ManagementPanel className="border border-border p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Admission process</p>
      <ol className="mt-4 flex flex-wrap items-center gap-2">
        {PROCESS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const done = index < activeIndex;
          const current = step.id === active;
          return (
            <li key={step.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  current && "border-brand-purple bg-brand-purple text-white",
                  done && !current && "border-green/30 bg-green/10 text-green",
                  !done && !current && "border-border bg-card text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {step.label}
              </span>
              {index < PROCESS_STEPS.length - 1 ? <ChevronRight className="h-3 w-3 text-muted-foreground/40" /> : null}
            </li>
          );
        })}
      </ol>
    </ManagementPanel>
  );
}

function ProgramOptionsEditor({
  label,
  options,
  onChange,
}: {
  label: string;
  options: string[];
  onChange: (options: string[]) => void;
}) {
  return (
    <div className="w-full space-y-3">
      <AdminFormField label={label}>
        <textarea
          value={options.join("\n")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          className={dashboardMonoTextareaClass}
          placeholder="One program or grade per line"
          rows={Math.min(Math.max(options.length, 4), 10)}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {options.length} option{options.length === 1 ? "" : "s"} · dropdown on apply form
        </p>
      </AdminFormField>
      {options.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-border bg-background/60 p-3">
          {options.map((option) => (
            <span key={option} className="inline-flex max-w-full rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
              <span className="truncate">{option}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LivePreviewPanel({ draft }: { draft: AdmissionConfig }) {
  const steps = buildAdmissionsPublicSteps(draft);
  const requirements = buildAdmissionsRequirements(draft);

  return (
    <ManagementPanel className="sticky top-4 border border-brand-purple/15 bg-brand-purple/[0.03]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-purple">Live preview</p>
          <p className="text-sm font-semibold">Public &amp; apply flow</p>
        </div>
        <div className="flex gap-1">
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
            <Link href="/admissions" target="_blank" rel="noopener noreferrer">/admissions</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
            <Link href="/admissions/apply" target="_blank" rel="noopener noreferrer">
              Apply <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-purple">
          {SCHOOL_TYPE_LABELS[draft.schoolType]} · {draft.schoolName}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{draft.welcomeMessage}</p>
        <p className="text-2xl font-bold text-brand-purple">{formatAdmissionFee(draft.applicationFee)}</p>
      </div>

      <div className="mt-4 space-y-2">
        {steps.slice(0, 2).map((step) => (
          <div key={step.title} className="rounded-lg border border-border bg-card p-2.5">
            <p className="text-xs font-semibold">{step.title}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requirements</p>
      <ul className="mt-1.5 space-y-1">
        {requirements.slice(0, 4).map((item) => (
          <li key={item} className="flex gap-1.5 text-[11px]">
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-brand-purple" />
            <span className="line-clamp-1">{item}</span>
          </li>
        ))}
      </ul>
    </ManagementPanel>
  );
}

function configsEqual(a: AdmissionConfig, b: AdmissionConfig) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SuperAdminAdmissionSettings({ backHref = "/super-admin" }: { backHref?: string }) {
  const pageLoading = usePageLoading();
  const { data: config = FALLBACK, isFetching, isFetched } = useAdmissionConfig();
  const saveConfig = useUpdateAdmissionConfig();
  const { lastInvalidatedAt } = useAdmissionsLiveStore();
  const [draft, setDraft] = useState<AdmissionConfig>(FALLBACK);
  const [section, setSection] = useState<SectionId>("institution");
  const [dirty, setDirty] = useState(false);
  const [remotePending, setRemotePending] = useState(false);
  const lastAppliedRemote = useRef<string | null>(null);

  const loading = superAdminInitialLoading(pageLoading, isFetching, isFetched);

  const patchDraft = useCallback((patch: Partial<AdmissionConfig>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!config || dirty) return;
    setDraft(config);
  }, [config, dirty]);

  useEffect(() => {
    if (!lastInvalidatedAt || lastInvalidatedAt === lastAppliedRemote.current) return;
    lastAppliedRemote.current = lastInvalidatedAt;
    if (dirty) {
      setRemotePending(true);
      return;
    }
    if (config) setDraft(config);
  }, [lastInvalidatedAt, dirty, config]);

  const stats = useMemo(
    () => ({
      open: draft.applicationOpen,
      fee: formatAdmissionFee(draft.applicationFee),
      programs: draft.programOptions.length,
      documents: draft.requiredDocuments.filter((d) => d.required).length,
    }),
    [draft],
  );

  const onSchoolTypeChange = async (schoolType: SchoolType) => {
    const updated = await saveConfig.mutateAsync({ action: "set_school_type", schoolType });
    if (updated && typeof updated === "object" && "schoolType" in updated) {
      setDraft(updated as AdmissionConfig);
      setDirty(false);
      toast.success(`Intake set to ${SCHOOL_TYPE_LABELS[schoolType]}`);
    }
  };

  const onSave = async () => {
    const saved = await saveConfig.mutateAsync(draft);
    if (saved) setDraft(saved as AdmissionConfig);
    setDirty(false);
    setRemotePending(false);
    toast.success("Admission configuration published");
  };

  const applyRemoteChanges = () => {
    if (config) setDraft(config);
    setDirty(false);
    setRemotePending(false);
    toast.message("Loaded latest configuration");
  };

  const updateDoc = (index: number, field: "label" | "description" | "required", value: string | boolean) => {
    patchDraft({
      requiredDocuments: draft.requiredDocuments.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc)),
    });
  };

  const addDoc = () => {
    patchDraft({
      requiredDocuments: [
        ...draft.requiredDocuments,
        { id: `doc-${Date.now()}`, label: "New document", description: "", required: true },
      ],
    });
  };

  const removeDoc = (index: number) => {
    patchDraft({ requiredDocuments: draft.requiredDocuments.filter((_, i) => i !== index) });
  };

  if (loading) return <SuperAdminListSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6">
      <AdminBackLink href={backHref} label="Back to dashboard" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Admission setup</h1>
            <AdmissionsLiveBadge isFetching={isFetching} />
            {dirty ? (
              <span className="rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-xs font-semibold text-brand-orange">Unsaved changes</span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Configure the full admission pipeline. Changes sync in real time to /admissions and the apply wizard.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admissions/apply" target="_blank" rel="noopener noreferrer">
              Preview apply <ExternalLink className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={() => void onSave()} disabled={saveConfig.isPending || !dirty} className="rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90">
            {saveConfig.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish changes
          </Button>
        </div>
      </div>

      {remotePending ? (
        <ManagementPanel className="flex flex-col gap-3 border border-brand-blue/20 bg-brand-blue/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="text-sm font-semibold">New configuration available</p>
              <p className="text-xs text-muted-foreground">Another session updated admission settings while you were editing.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRemotePending(false)}>Keep editing</Button>
            <Button size="sm" className="rounded-full bg-brand-blue text-white" onClick={applyRemoteChanges}>Load latest</Button>
          </div>
        </ManagementPanel>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard label="Applications" value={stats.open ? "Open" : "Closed"} hint={draft.intakeStatusNote} tone={stats.open ? "green" : "orange"} />
        <ManagementStatCard label="Application fee" value={stats.fee} tone="purple" />
        <ManagementStatCard label="Programs" value={String(stats.programs)} hint={draft.programLabel} tone="blue" />
        <ManagementStatCard label="Required docs" value={String(stats.documents)} tone="orange" />
      </div>

      <ProcessPipeline active={section} />

      <div className="grid gap-6 xl:grid-cols-[13rem_minmax(0,1fr)_minmax(16rem,20rem)]">
        <nav className="hidden xl:block">
          <ManagementPanel className="sticky top-4 space-y-1 border border-border p-2">
            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setSection(step.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                    section === step.id ? "bg-brand-purple text-white" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {step.label}
                </button>
              );
            })}
          </ManagementPanel>
        </nav>

        <div className="min-w-0 space-y-5">
          <select value={section} onChange={(e) => setSection(e.target.value as SectionId)} className={cn(dashboardFieldClass, "xl:hidden")} aria-label="Select section">
            {PROCESS_STEPS.map((step) => (
              <option key={step.id} value={step.id}>{step.label}</option>
            ))}
          </select>

          {section === "institution" ? (
            <ManagementPanel className="border border-brand-blue/15 bg-brand-blue/[0.02]">
              <h2 className="text-lg font-bold">Institution type</h2>
              <p className="mt-1 text-sm text-muted-foreground">Single intake model — applicants don&apos;t pick secondary vs university.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => void onSchoolTypeChange(type)}
                    disabled={saveConfig.isPending}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      draft.schoolType === type ? "border-brand-purple bg-brand-purple/5 shadow-sm" : "border-border hover:border-brand-purple/40",
                    )}
                  >
                    <p className="font-semibold">{SCHOOL_TYPE_LABELS[type]}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{SCHOOL_TYPE_HINTS[type]}</p>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <AdminFormField label="School name">
                  <input value={draft.schoolName} onChange={(e) => patchDraft({ schoolName: e.target.value })} className={dashboardFieldClass} />
                </AdminFormField>
                <AdminFormField label="Admissions department">
                  <input value={draft.departmentName} onChange={(e) => patchDraft({ departmentName: e.target.value })} className={dashboardFieldClass} />
                </AdminFormField>
              </div>
              <div className="mt-4">
                <SettingsToggle label="Applications open" description="When off, the apply wizard shows a closed message." checked={draft.applicationOpen} onChange={(v) => patchDraft({ applicationOpen: v })} />
              </div>
            </ManagementPanel>
          ) : null}

          {section === "programs" ? (
            <ManagementPanel className="border border-border">
              <h2 className="text-lg font-bold">Programs &amp; messaging</h2>
              <p className="mt-1 text-sm text-muted-foreground">Dropdown options and apply wizard banner copy.</p>
              <div className="mt-5">
                <ProgramOptionsEditor label={draft.programLabel} options={draft.programOptions} onChange={(programOptions) => patchDraft({ programOptions })} />
              </div>
              <div className="mt-4">
                <AdminFormField label="Welcome message (apply wizard banner)">
                  <textarea value={draft.welcomeMessage} onChange={(e) => patchDraft({ welcomeMessage: e.target.value })} className={dashboardTextareaClass} rows={3} />
                </AdminFormField>
              </div>
            </ManagementPanel>
          ) : null}

          {section === "documents" ? (
            <ManagementPanel className="border border-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Documents &amp; screening</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Upload requirements and internal vetting rules.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addDoc}>
                  <Plus className="mr-1 h-4 w-4" /> Add document
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {draft.requiredDocuments.map((doc, index) => (
                  <li key={doc.id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <AdminFormField label="Label">
                        <input value={doc.label} onChange={(e) => updateDoc(index, "label", e.target.value)} className={dashboardFieldClass} />
                      </AdminFormField>
                      <AdminFormField label="Description">
                        <input value={doc.description} onChange={(e) => updateDoc(index, "description", e.target.value)} className={dashboardFieldClass} />
                      </AdminFormField>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={doc.required} onChange={(e) => updateDoc(index, "required", e.target.checked)} />
                        Required
                      </label>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeDoc(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                <h3 className="text-sm font-bold">Screening checklist</h3>
                <textarea
                  value={draft.screeningRules.map((r) => `${r.label}: ${r.description}`).join("\n")}
                  onChange={(e) =>
                    patchDraft({
                      screeningRules: e.target.value.split("\n").filter(Boolean).map((line, i) => {
                        const [label, ...rest] = line.split(":");
                        return { id: `rule-${i}`, label: (label ?? `Rule ${i + 1}`).trim(), description: rest.join(":").trim() || "Verify during review" };
                      }),
                    })
                  }
                  className={`${dashboardMonoTextareaClass} mt-3`}
                  rows={5}
                />
              </div>
            </ManagementPanel>
          ) : null}

          {section === "exam" ? (
            <ManagementPanel className="border border-border">
              <h2 className="text-lg font-bold">Entrance examination</h2>
              <p className="mt-1 text-sm text-muted-foreground">Online exam portal settings referenced on the public page.</p>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <AdminFormField label="Exam subjects (comma-separated)">
                  <input value={draft.examSubjects.join(", ")} onChange={(e) => patchDraft({ examSubjects: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={dashboardFieldClass} />
                </AdminFormField>
                <div className="grid gap-4 sm:grid-cols-3">
                  <AdminFormField label="Duration (min)">
                    <input type="number" value={draft.examDurationMinutes} onChange={(e) => patchDraft({ examDurationMinutes: Number(e.target.value) })} className={dashboardFieldClass} />
                  </AdminFormField>
                  <AdminFormField label="Pass (%)">
                    <input type="number" value={draft.examPassingScore} onChange={(e) => patchDraft({ examPassingScore: Number(e.target.value) })} className={dashboardFieldClass} />
                  </AdminFormField>
                  <AdminFormField label="Qs/subject">
                    <input type="number" value={draft.examQuestionsPerSubject} onChange={(e) => patchDraft({ examQuestionsPerSubject: Number(e.target.value) })} className={dashboardFieldClass} />
                  </AdminFormField>
                </div>
              </div>
            </ManagementPanel>
          ) : null}

          {section === "fees" ? (
            <ManagementPanel className="border border-brand-purple/15 bg-brand-purple/[0.02]">
              <h2 className="text-lg font-bold">Fees &amp; payment</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)]">
                <div className="space-y-3">
                  <AdminFormField label="Application fee (NGN)">
                    <input type="number" min={0} value={draft.applicationFee} onChange={(e) => patchDraft({ applicationFee: Number(e.target.value) })} className={dashboardFieldClass} />
                  </AdminFormField>
                  <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 px-4 py-3 text-center">
                    <p className="text-[11px] font-semibold uppercase text-brand-purple">Displayed</p>
                    <p className="text-2xl font-bold text-brand-purple">{formatAdmissionFee(draft.applicationFee)}</p>
                  </div>
                </div>
                <AdminFormField label="Payment instructions">
                  <textarea value={draft.paymentInstructions} onChange={(e) => patchDraft({ paymentInstructions: e.target.value })} className={dashboardTextareaClass} rows={5} />
                </AdminFormField>
              </div>
              <div className="mt-5 space-y-3">
                <SettingsToggle label="Real-time payment step" description="Pay-now button after submission." checked={draft.enableRealTimePayment} onChange={(v) => patchDraft({ enableRealTimePayment: v })} />
                <SettingsToggle label="Google sign-in" checked={draft.enableGoogleAuth} onChange={(v) => patchDraft({ enableGoogleAuth: v })} />
                <SettingsToggle label="Apple sign-in" checked={draft.enableAppleAuth} onChange={(v) => patchDraft({ enableAppleAuth: v })} />
              </div>
              <div className="mt-4 flex gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <Info className="h-4 w-4 shrink-0 text-brand-blue" />
                <p className="text-sm text-muted-foreground">After enrollment, students sign in with email; initial password is first name (lowercase).</p>
              </div>
            </ManagementPanel>
          ) : null}

          {section === "public" ? (
            <ManagementPanel className="border border-border">
              <h2 className="text-lg font-bold">Public admissions page</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hero and dates at /admissions. Steps and requirements auto-build from other sections.</p>
              <div className="mt-5 space-y-4">
                <AdminFormField label="Hero title">
                  <input value={draft.publicHeroTitle} onChange={(e) => patchDraft({ publicHeroTitle: e.target.value })} className={dashboardFieldClass} />
                </AdminFormField>
                <AdminFormField label="Hero description">
                  <textarea value={draft.publicHeroDescription} onChange={(e) => patchDraft({ publicHeroDescription: e.target.value })} className={dashboardTextareaClass} rows={3} />
                </AdminFormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminFormField label="Intake status note">
                    <input value={draft.intakeStatusNote} onChange={(e) => patchDraft({ intakeStatusNote: e.target.value })} className={dashboardFieldClass} />
                  </AdminFormField>
                  <AdminFormField label="Response time note">
                    <input value={draft.responseTimeNote} onChange={(e) => patchDraft({ responseTimeNote: e.target.value })} className={dashboardFieldClass} />
                  </AdminFormField>
                </div>
              </div>
            </ManagementPanel>
          ) : null}

          {section === "review" ? (
            <ManagementPanel className="border border-green/20 bg-green/[0.03]">
              <h2 className="text-lg font-bold">Review &amp; publish</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confirm settings before publishing to the live admission flow.</p>
              <dl className="mt-5 divide-y divide-border rounded-xl border border-border bg-card text-sm">
                {[
                  ["Institution", `${SCHOOL_TYPE_LABELS[draft.schoolType]} · ${draft.schoolName}`],
                  ["Programs", `${draft.programOptions.length} ${draft.programLabel.toLowerCase()} options`],
                  ["Documents", `${draft.requiredDocuments.filter((d) => d.required).length} required uploads`],
                  ["Exam", `${draft.examSubjects.length} subjects · ${draft.examDurationMinutes} min · pass ${draft.examPassingScore}%`],
                  ["Fee", formatAdmissionFee(draft.applicationFee)],
                  ["Status", draft.applicationOpen ? `Open — ${draft.intakeStatusNote}` : "Closed"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <Button onClick={() => void onSave()} disabled={saveConfig.isPending || (!dirty && config && configsEqual(draft, config))} className="mt-5 rounded-full bg-brand-purple px-6 text-white hover:bg-brand-purple/90">
                {saveConfig.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Publish to live admission flow
              </Button>
            </ManagementPanel>
          ) : null}

          <div className="flex justify-between gap-3 xl:hidden">
            <Button type="button" variant="outline" className="rounded-full" disabled={PROCESS_STEPS.findIndex((s) => s.id === section) === 0} onClick={() => { const i = PROCESS_STEPS.findIndex((s) => s.id === section); if (i > 0) setSection(PROCESS_STEPS[i - 1]!.id); }}>Previous</Button>
            <Button type="button" className="rounded-full bg-brand-purple text-white" disabled={section === "review"} onClick={() => { const i = PROCESS_STEPS.findIndex((s) => s.id === section); if (i < PROCESS_STEPS.length - 1) setSection(PROCESS_STEPS[i + 1]!.id); }}>Next</Button>
          </div>
        </div>

        <div className="hidden xl:block">
          <LivePreviewPanel draft={draft} />
        </div>
      </div>
    </div>
  );
}
