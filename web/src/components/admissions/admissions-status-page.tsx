"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmissionByReference, usePayAdmissionByReference } from "@/hooks/use-dashboard-data";
import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUS_STYLES,
  formatAdmissionFee,
} from "@/components/admissions/admissions-workflow-data";
import { AdmissionPrintSlip } from "@/components/admissions/admission-print-slip";
import { cn } from "@/lib/utils";

export function AdmissionsStatusPage({ reference }: { reference: string }) {
  const { data: admission, isLoading, isError, refetch } = useAdmissionByReference(reference);
  const payAdmission = usePayAdmissionByReference(reference);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (isError || !admission) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-8 text-center">
        <h2 className="font-display text-xl font-bold">Application not found</h2>
        <p className="mt-2 text-sm text-marketing-muted">Check your reference number and try again.</p>
        <Link href="/admissions/apply" className="auth-btn-primary mt-6 inline-flex">
          Start new application
        </Link>
      </div>
    );
  }

  const onPay = async () => {
    await payAdmission.mutateAsync();
    await refetch();
  };

  const canTakeExam = admission.status === "exam_scheduled" || admission.examStatus === "in_progress";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">Application status</p>
        <h1 className="mt-2 font-display text-2xl font-bold">{admission.applicantName}</h1>
        <p className="mt-1 font-mono text-sm text-marketing-muted">{admission.reference}</p>
        <span className={cn("mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold", ADMISSION_STATUS_STYLES[admission.status])}>
          {ADMISSION_STATUS_LABELS[admission.status]}
        </span>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-marketing-muted">Program / grade</dt><dd className="font-semibold">{admission.gradeApplied}</dd></div>
          <div><dt className="text-marketing-muted">Application fee</dt><dd className="font-semibold">{formatAdmissionFee(admission.paymentAmount)}</dd></div>
          <div><dt className="text-marketing-muted">Payment</dt><dd className="font-semibold capitalize">{admission.paymentStatus}</dd></div>
          {admission.examScore != null ? (
            <div><dt className="text-marketing-muted">Exam score</dt><dd className="font-semibold">{admission.examScore}%</dd></div>
          ) : null}
        </dl>

        {admission.paymentStatus === "pending" ? (
          <Button onClick={onPay} disabled={payAdmission.isPending} className="mt-6 rounded-full bg-brand-purple text-white">
            Pay application fee
          </Button>
        ) : null}

        {canTakeExam ? (
          <Button asChild className="mt-6 rounded-full bg-brand-purple text-white">
            <Link href={`/admissions/exam/${encodeURIComponent(reference)}`}>Enter examination portal</Link>
          </Button>
        ) : null}

        {admission.status === "documents_review" ? (
          <p className="mt-6 rounded-xl bg-brand-purple/5 p-4 text-sm text-marketing-muted">
            Your documents are being reviewed. You will be notified when you are eligible for the entrance exam.
          </p>
        ) : null}

        {admission.status === "approved" && !admission.studentId ? (
          <p className="mt-6 rounded-xl bg-green/10 p-4 text-sm text-marketing-text">
            Congratulations — admission approved. The school will create your student account (email + first name as initial password).
          </p>
        ) : null}

        {admission.status === "enrolled" ? (
          <p className="mt-6 rounded-xl bg-green/10 p-4 text-sm text-marketing-text">
            You are enrolled. Log in with your email and the password provided by admissions.
          </p>
        ) : null}
      </div>

      {admission.examSetup ? (
        <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 lg:p-8">
          <h2 className="font-display text-xl font-bold">Examination slip</h2>
          <div className="mt-4">
            <AdmissionPrintSlip admission={admission} />
          </div>
        </div>
      ) : admission.paymentStatus === "paid" ? (
        <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6 text-sm text-marketing-muted">
          Payment received. Admissions is reviewing your uploads before scheduling the exam.
        </div>
      ) : null}

      <div className="text-center">
        <Link href="/admissions" className="text-sm font-semibold text-brand-purple hover:underline">
          Back to admissions
        </Link>
      </div>
    </div>
  );
}
