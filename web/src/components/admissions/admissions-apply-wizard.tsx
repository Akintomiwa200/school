"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, CreditCard, Loader2, Upload } from "lucide-react";
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
import {
  useAdmissionConfig,
  useCreateAdmission,
  usePayAdmissionByReference,
} from "@/hooks/use-dashboard-data";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isGoogleAuthEnabled } from "@/config/auth-public";

const STEPS = ["Details", "Documents", "Review", "Payment", "Done"] as const;

export function AdmissionsApplyWizard() {
  const { data: config = createDefaultAdmissionConfig("university"), isLoading } = useAdmissionConfig();
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

  const payAdmission = usePayAdmissionByReference(submitted?.reference ?? "");

  useEffect(() => {
    if (config.programOptions[0] && !gradeApplied) {
      setGradeApplied(config.programOptions[0]!);
    }
  }, [config.programOptions, gradeApplied]);

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

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-marketing-surface" />;
  }

  if (!config.applicationOpen) {
    return (
      <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-8 text-center">
        <h2 className="font-display text-xl font-bold">Applications closed</h2>
        <p className="mt-2 text-sm text-marketing-muted">{config.schoolName} is not accepting applications right now.</p>
        <Link href="/contact" className="mt-4 inline-block text-sm font-semibold text-brand-purple hover:underline">
          Contact admissions
        </Link>
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple">
          {SCHOOL_TYPE_LABELS[config.schoolType]} · {config.schoolName}
        </p>
        <p className="mt-1 text-sm text-marketing-muted">{config.welcomeMessage}</p>
      </div>

      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              index === step ? "bg-brand-purple text-white" : index < step ? "bg-green/15 text-green" : "bg-marketing-surface text-marketing-muted",
            )}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <form
          className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(1);
          }}
        >
          <h2 className="font-display text-2xl font-bold">Your details</h2>
          <p className="mt-1 text-sm text-marketing-muted">
            Applying for {config.programLabel.toLowerCase()}: fee {formatAdmissionFee(config.applicationFee)}
          </p>
          {config.enableGoogleAuth && isGoogleAuthEnabled ? (
            <div className="mt-4">
              <GoogleSignInButton callbackUrl="/admissions/apply" label="Continue with Google" />
              <p className="mt-2 text-center text-xs text-marketing-muted">or fill the form below</p>
            </div>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">First name</span>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="auth-input mt-1.5 w-full" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Last name</span>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="auth-input mt-1.5 w-full" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input mt-1.5 w-full" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Phone</span>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="auth-input mt-1.5 w-full" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Parent / guardian</span>
              <input required value={guardian} onChange={(e) => setGuardian(e.target.value)} className="auth-input mt-1.5 w-full" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">{config.programLabel}</span>
              <select required value={gradeApplied} onChange={(e) => setGradeApplied(e.target.value)} className="auth-input mt-1.5 w-full">
                {config.programOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Button type="submit" className="mt-6 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </form>
      ) : null}

      {step === 1 ? (
        <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
          <h2 className="font-display text-2xl font-bold">Upload documents</h2>
          <p className="mt-1 text-sm text-marketing-muted">
            Upload clear scans or photos. Admissions will vet these before you can sit the entrance exam.
          </p>
          <ul className="mt-6 space-y-4">
            {config.requiredDocuments.map((req) => (
              <li key={req.id} className="rounded-xl border border-marketing-grid/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {req.label}
                      {req.required ? <span className="text-destructive"> *</span> : null}
                    </p>
                    <p className="text-xs text-marketing-muted">{req.description}</p>
                  </div>
                  <Upload className="h-5 w-5 shrink-0 text-brand-purple" />
                </div>
                <input
                  type="file"
                  className="mt-3 w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploads((prev) => ({ ...prev, [req.id]: file.name }));
                  }}
                />
                {uploads[req.id] ? (
                  <p className="mt-1 text-xs text-green">Selected: {uploads[req.id]}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(0)} className="rounded-full">
              Back
            </Button>
            <Button
              type="button"
              disabled={missingRequired.length > 0}
              onClick={() => setStep(2)}
              className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
          <h2 className="font-display text-2xl font-bold">Review &amp; submit</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-marketing-muted">Name</dt><dd className="font-medium">{firstName} {lastName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-marketing-muted">Email</dt><dd className="font-medium">{email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-marketing-muted">{config.programLabel}</dt><dd className="font-medium">{gradeApplied}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-marketing-muted">Documents</dt><dd className="font-medium">{documentPayload.length} uploaded</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-marketing-muted">Fee</dt><dd className="font-medium">{formatAdmissionFee(config.applicationFee)}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full">Back</Button>
            <Button type="button" disabled={createAdmission.isPending} onClick={() => void onSubmitApplication()} className="rounded-full bg-brand-purple text-white">
              {createAdmission.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit application
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && submitted ? (
        <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
          <CreditCard className="h-8 w-8 text-brand-purple" />
          <h2 className="mt-4 font-display text-2xl font-bold">Pay application fee</h2>
          <p className="font-mono text-sm text-marketing-muted">{submitted.reference}</p>
          <p className="mt-4 text-3xl font-bold">{formatAdmissionFee(submitted.paymentAmount)}</p>
          <p className="mt-2 text-sm text-marketing-muted">{config.paymentInstructions}</p>
          {config.enableRealTimePayment ? (
            <Button onClick={onPay} disabled={payAdmission.isPending} className="mt-6 rounded-full bg-brand-purple text-white">
              {payAdmission.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Pay now (demo gateway)
            </Button>
          ) : null}
          <Button asChild variant="outline" className="ml-3 mt-6 rounded-full">
            <Link href={`/admissions/status/${encodeURIComponent(submitted.reference)}`}>Track application</Link>
          </Button>
        </div>
      ) : null}

      {step === 4 && submitted ? (
        <div className="rounded-2xl border border-green/30 bg-green/5 p-6 text-center lg:p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green" />
          <h2 className="mt-4 font-display text-2xl font-bold">Application received</h2>
          <p className="mt-2 text-sm text-marketing-muted">Reference: <span className="font-mono font-semibold">{submitted.reference}</span></p>
          <p className="mt-2 text-sm text-marketing-muted">{ADMISSION_STATUS_LABELS[submitted.status]}</p>
          <p className="mt-4 text-sm text-marketing-muted">
            Next: admissions reviews your uploads, schedules your exam if eligible, then department approval before enrollment.
          </p>
          <Link href={`/admissions/status/${encodeURIComponent(submitted.reference)}`} className="auth-btn-primary mt-6 inline-flex">
            Track status &amp; exam
          </Link>
        </div>
      ) : null}
    </div>
  );
}
