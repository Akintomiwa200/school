"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ADMISSION_STATUS_LABELS,
  createDefaultAdmissionConfig,
  formatAdmissionFee,
  SCHOOL_TYPE_LABELS,
  type AdmissionRecord,
  type UploadedAdmissionDocument,
} from "@/components/admissions/admissions-workflow-data";
import { useAdmissionsLiveStore } from "@/components/admissions/admissions-live-store";
import {
  useAdmissionConfig,
  useCreateAdmission,
  usePayAdmissionByReference,
} from "@/hooks/use-dashboard-data";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isGoogleAuthEnabled } from "@/config/auth-public";

const STEPS = [
  { id: "details", label: "Your details", icon: User },
  { id: "documents", label: "Documents", icon: Upload },
  { id: "review", label: "Review", icon: FileText },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "done", label: "Complete", icon: CheckCircle2 },
] as const;

const applyFieldClass =
  "box-border block h-11 w-full max-w-full rounded-xl border border-marketing-grid/80 bg-marketing-bg px-4 text-sm text-marketing-text outline-none transition-shadow placeholder:text-marketing-muted/70 focus-visible:ring-2 focus-visible:ring-brand-purple/30";

function ApplyLiveBadge({ isFetching }: { isFetching?: boolean }) {
  const { connection, lastSyncedAt } = useAdmissionsLiveStore();
  const timeLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-marketing-grid/80 bg-marketing-surface px-2.5 py-1 text-xs font-medium text-marketing-muted">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connection === "error" ? "bg-brand-orange" : "bg-green",
          (isFetching || connection === "connecting" || connection === "reconnecting") && "animate-pulse",
          connection === "idle" && "opacity-40",
        )}
      />
      {connection === "error" ? "Reconnecting" : connection === "idle" ? "Offline" : "Live form"}
      {timeLabel ? <span className="opacity-70">· {timeLabel}</span> : null}
    </span>
  );
}

function ApplyFormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block w-full min-w-0 space-y-1.5", className)}>
      <span className="text-sm font-semibold text-marketing-text">{label}</span>
      {children}
    </label>
  );
}

function StepProgress({ step }: { step: number }) {
  return (
    <ol className="mb-8 grid gap-2 sm:grid-cols-5">
      {STEPS.map(({ label, icon: Icon }, index) => {
        const current = index === step;
        const done = index < step;
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors sm:flex-col sm:text-center",
              current && "border-brand-purple bg-brand-purple text-white",
              done && !current && "border-green/30 bg-green/10 text-green",
              !done && !current && "border-marketing-grid/80 bg-marketing-surface text-marketing-muted",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 sm:mx-auto" />
            <span className="min-w-0 truncate">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ApplySidebar({
  config,
  step,
  gradeApplied,
}: {
  config: ReturnType<typeof createDefaultAdmissionConfig>;
  step: number;
  gradeApplied: string;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-purple">
          {SCHOOL_TYPE_LABELS[config.schoolType]}
        </p>
        <h2 className="mt-1 font-display text-xl font-bold text-marketing-text">{config.schoolName}</h2>
        <p className="mt-2 text-sm leading-relaxed text-marketing-muted">{config.welcomeMessage}</p>
      </div>

      <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-marketing-muted">Application fee</p>
        <p className="mt-1 text-3xl font-bold text-brand-purple">{formatAdmissionFee(config.applicationFee)}</p>
        {gradeApplied ? (
          <p className="mt-3 text-sm text-marketing-muted">
            {config.programLabel}: <span className="font-semibold text-marketing-text">{gradeApplied}</span>
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-marketing-muted">Your progress</p>
        <ul className="mt-3 space-y-2">
          {STEPS.map(({ label }, index) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  index < step && "bg-green text-white",
                  index === step && "bg-brand-purple text-white",
                  index > step && "bg-marketing-grid/50 text-marketing-muted",
                )}
              >
                {index < step ? "✓" : index + 1}
              </span>
              <span className={cn(index === step ? "font-semibold text-marketing-text" : "text-marketing-muted")}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/admissions"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admissions info
      </Link>
    </aside>
  );
}

function ApplySkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6">
      <div className="h-32 rounded-2xl bg-marketing-surface" />
      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="h-96 rounded-2xl bg-marketing-surface" />
        <div className="h-64 rounded-2xl bg-marketing-surface" />
      </div>
    </div>
  );
}

export function AdmissionsApplyWizard() {
  const { data: config = createDefaultAdmissionConfig("university"), isLoading, isFetching } = useAdmissionConfig();
  const { lastInvalidatedAt } = useAdmissionsLiveStore();
  const createAdmission = useCreateAdmission();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guardian, setGuardian] = useState("");
  const [gradeApplied, setGradeApplied] = useState("");
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<AdmissionRecord | null>(null);
  const [configUpdated, setConfigUpdated] = useState(false);
  const knownConfigVersion = useRef(config.updatedAt);

  const payAdmission = usePayAdmissionByReference(submitted?.reference ?? "");

  useEffect(() => {
    if (config.programOptions[0] && !gradeApplied) {
      setGradeApplied(config.programOptions[0]!);
    }
  }, [config.programOptions, gradeApplied]);

  useEffect(() => {
    if (!gradeApplied) return;
    if (!config.programOptions.includes(gradeApplied) && config.programOptions[0]) {
      setGradeApplied(config.programOptions[0]!);
    }
  }, [config.programOptions, gradeApplied]);

  useEffect(() => {
    if (!lastInvalidatedAt || step >= 3) return;
    if (config.updatedAt !== knownConfigVersion.current) {
      setConfigUpdated(true);
    }
  }, [lastInvalidatedAt, config.updatedAt, step]);

  const dismissConfigUpdate = () => {
    knownConfigVersion.current = config.updatedAt;
    setConfigUpdated(false);
  };

  const documentPayload = useMemo((): UploadedAdmissionDocument[] => {
    const now = new Date().toISOString();
    return config.requiredDocuments
      .filter((req) => uploads[req.id])
      .map((req) => ({
        requirementId: req.id,
        fileName: uploads[req.id]!,
        uploadedAt: now,
        status: "pending" as const,
      }));
  }, [config.requiredDocuments, uploads]);

  const missingRequired = config.requiredDocuments.filter((r) => r.required && !uploads[r.id]);

  if (isLoading) return <ApplySkeleton />;

  if (!config.applicationOpen) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-marketing-grid/80 bg-marketing-surface p-10 text-center">
        <span className="inline-flex rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-orange">
          Applications closed
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold">{config.schoolName}</h2>
        <p className="mt-2 text-sm leading-relaxed text-marketing-muted">
          We are not accepting new applications right now. Check back later or contact admissions for help.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/admissions" className="auth-btn-primary inline-flex justify-center">
            View admissions info
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-brand-purple px-6 py-3 text-sm font-semibold text-brand-purple hover:bg-brand-purple/5"
          >
            Contact admissions
          </Link>
        </div>
      </div>
    );
  }

  const onSubmitApplication = async () => {
    const record = await createAdmission.mutateAsync({
      firstName,
      lastName,
      email,
      phone,
      gradeApplied,
      guardian,
      documents: documentPayload,
    });
    setSubmitted(record);
    setStep(3);
  };

  const onPay = async () => {
    if (!submitted) return;
    const updated = await payAdmission.mutateAsync();
    setSubmitted(updated);
    setStep(4);
  };

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-purple">Online application</p>
          <h1 className="font-display text-2xl font-bold text-marketing-text sm:text-3xl">
            Apply to {config.schoolName}
          </h1>
        </div>
        <ApplyLiveBadge isFetching={isFetching} />
      </div>

      {configUpdated ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
            <div>
              <p className="text-sm font-semibold text-marketing-text">Admission requirements updated</p>
              <p className="text-xs text-marketing-muted">Fee, programs, or documents may have changed. Review before continuing.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={dismissConfigUpdate}>
            Got it
          </Button>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <div className="min-w-0">
          <StepProgress step={step} />

          {step === 0 ? (
            <form
              className="rounded-[1.5rem] border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                setStep(1);
              }}
            >
              <h2 className="font-display text-2xl font-bold">Your details</h2>
              <p className="mt-1 text-sm text-marketing-muted">
                {config.programLabel} · fee {formatAdmissionFee(config.applicationFee)}
              </p>

              {config.enableGoogleAuth && isGoogleAuthEnabled ? (
                <div className="mt-5 rounded-xl border border-marketing-grid/60 bg-marketing-bg p-4">
                  <GoogleSignInButton callbackUrl="/admissions/apply" label="Continue with Google" />
                  <p className="mt-2 text-center text-xs text-marketing-muted">or complete the form below</p>
                </div>
              ) : null}

              <div className="mt-6 grid w-full gap-4 sm:grid-cols-2">
                <ApplyFormField label="First name">
                  <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={applyFieldClass} autoComplete="given-name" />
                </ApplyFormField>
                <ApplyFormField label="Last name">
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={applyFieldClass} autoComplete="family-name" />
                </ApplyFormField>
                <ApplyFormField label="Email">
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={applyFieldClass} autoComplete="email" />
                </ApplyFormField>
                <ApplyFormField label="Phone">
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={applyFieldClass} autoComplete="tel" />
                </ApplyFormField>
                <ApplyFormField label="Parent / guardian" className="sm:col-span-2">
                  <input required value={guardian} onChange={(e) => setGuardian(e.target.value)} className={applyFieldClass} />
                </ApplyFormField>
                <ApplyFormField label={config.programLabel} className="sm:col-span-2">
                  <select required value={gradeApplied} onChange={(e) => setGradeApplied(e.target.value)} className={cn(applyFieldClass, "appearance-none")}>
                    {config.programOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </ApplyFormField>
              </div>

              <Button type="submit" className="mt-6 rounded-full bg-brand-purple px-6 text-white hover:bg-brand-purple/90">
                Continue to documents
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          ) : null}

          {step === 1 ? (
            <div className="rounded-[1.5rem] border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
              <h2 className="font-display text-2xl font-bold">Upload documents</h2>
              <p className="mt-1 text-sm text-marketing-muted">
                Upload clear scans or photos. Admissions will review these before your entrance exam.
              </p>
              <ul className="mt-6 space-y-4">
                {config.requiredDocuments.map((req) => (
                  <li key={req.id} className="rounded-xl border border-marketing-grid/60 bg-marketing-bg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-marketing-text">
                          {req.label}
                          {req.required ? <span className="text-destructive"> *</span> : null}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-marketing-muted">{req.description}</p>
                      </div>
                      <Upload className="h-5 w-5 shrink-0 text-brand-purple" />
                    </div>
                    <input
                      type="file"
                      className="mt-3 w-full max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-purple/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-purple"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploads((prev) => ({ ...prev, [req.id]: file.name }));
                      }}
                    />
                    {uploads[req.id] ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {uploads[req.id]}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {missingRequired.length > 0 ? (
                <p className="mt-4 text-xs text-brand-orange">
                  {missingRequired.length} required document{missingRequired.length === 1 ? "" : "s"} still needed
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)} className="rounded-full">Back</Button>
                <Button type="button" disabled={missingRequired.length > 0} onClick={() => setStep(2)} className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                  Continue to review
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-[1.5rem] border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
              <h2 className="font-display text-2xl font-bold">Review &amp; submit</h2>
              <p className="mt-1 text-sm text-marketing-muted">Confirm your details before submitting.</p>
              <dl className="mt-5 divide-y divide-marketing-grid/60 rounded-xl border border-marketing-grid/60 bg-marketing-bg text-sm">
                {[
                  ["Name", `${firstName} ${lastName}`],
                  ["Email", email],
                  ["Phone", phone],
                  ["Guardian", guardian],
                  [config.programLabel, gradeApplied],
                  ["Documents", `${documentPayload.length} uploaded`],
                  ["Application fee", formatAdmissionFee(config.applicationFee)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-marketing-muted">{label}</dt>
                    <dd className="max-w-[55%] text-right font-semibold text-marketing-text">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                <Button type="button" disabled={createAdmission.isPending} onClick={() => void onSubmitApplication()} className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                  {createAdmission.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit application
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 && submitted ? (
            <div className="rounded-[1.5rem] border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/10">
                <CreditCard className="h-6 w-6 text-brand-purple" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">Pay application fee</h2>
              <p className="mt-1 font-mono text-sm text-marketing-muted">{submitted.reference}</p>
              <p className="mt-4 text-4xl font-bold text-brand-purple">{formatAdmissionFee(submitted.paymentAmount)}</p>
              <p className="mt-3 text-sm leading-relaxed text-marketing-muted">{config.paymentInstructions}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {config.enableRealTimePayment ? (
                  <Button onClick={() => void onPay()} disabled={payAdmission.isPending} className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                    {payAdmission.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay now
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/admissions/status/${encodeURIComponent(submitted.reference)}`}>Track application</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {step === 4 && submitted ? (
            <div className="rounded-[1.5rem] border border-green/30 bg-green/5 p-8 text-center lg:p-10">
              <CheckCircle2 className="mx-auto h-14 w-14 text-green" />
              <h2 className="mt-4 font-display text-2xl font-bold">Application received</h2>
              <p className="mt-2 text-sm text-marketing-muted">
                Reference: <span className="font-mono font-semibold text-marketing-text">{submitted.reference}</span>
              </p>
              <p className="mt-1 text-sm font-medium text-green">{ADMISSION_STATUS_LABELS[submitted.status]}</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-marketing-muted">
                Next: admissions reviews your uploads, schedules your exam if eligible, then final approval before enrollment.
              </p>
              <Link href={`/admissions/status/${encodeURIComponent(submitted.reference)}`} className="auth-btn-primary mt-6 inline-flex">
                Track status &amp; exam
              </Link>
            </div>
          ) : null}
        </div>

        {step < 3 ? <ApplySidebar config={config} step={step} gradeApplied={gradeApplied} /> : null}
      </div>
    </div>
  );
}
