"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ADMISSION_STATUS_LABELS,
  formatAdmissionFee,
  type AdmissionRecord,
} from "@/components/admissions/admissions-workflow-data";

export function AdmissionPrintSlip({ admission, onPrint }: { admission: AdmissionRecord; onPrint?: () => void }) {
  const handlePrint = () => {
    onPrint?.();
    window.print();
  };

  if (!admission.examSetup) {
    return (
      <p className="text-sm text-muted-foreground">
        Schedule an entrance examination before printing the exam slip.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        id="admission-exam-slip"
        className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-6 print:border-solid print:shadow-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pathway Academy</p>
            <h3 className="mt-1 text-lg font-bold">Entrance Examination Slip</h3>
            <p className="text-sm text-muted-foreground">
              {admission.institutionType === "secondary" ? "Secondary School" : "University"} admission
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="font-mono text-sm font-bold">{admission.reference}</p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Applicant</dt>
            <dd className="font-semibold">{admission.applicantName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Program / Grade</dt>
            <dd className="font-semibold">{admission.gradeApplied}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Exam date</dt>
            <dd className="font-semibold">{admission.examSetup.examDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="font-semibold">{admission.examSetup.examTime}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Venue</dt>
            <dd className="font-semibold">{admission.examSetup.venue}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Subjects</dt>
            <dd className="font-semibold">{admission.examSetup.subjects.join(" · ")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="font-semibold capitalize">{admission.paymentStatus}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fee paid</dt>
            <dd className="font-semibold">{formatAdmissionFee(admission.paymentAmount)}</dd>
          </div>
        </dl>

        {admission.examSetup.instructions ? (
          <p className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            {admission.examSetup.instructions}
          </p>
        ) : null}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Status: {ADMISSION_STATUS_LABELS[admission.status]} · Bring this slip and a valid ID on exam day
        </p>
      </div>

      <Button type="button" onClick={handlePrint} className="h-10 rounded-full bg-primary px-5 print:hidden">
        <Printer className="mr-2 h-4 w-4" />
        Print exam slip
      </Button>
    </div>
  );
}
