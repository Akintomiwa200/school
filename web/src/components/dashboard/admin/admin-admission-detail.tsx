"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  School,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAdmission, useAdmissionConfig, useClassesList, useUpdateAdmission } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUS_STYLES,
  createDefaultAdmissionConfig,
  examSubjectsFor,
  formatAdmissionFee,
  parseGradeNumber,
  type AdmissionExamSetup,
} from "@/components/admissions/admissions-workflow-data";
import { AdmissionPrintSlip } from "@/components/admissions/admission-print-slip";
import { ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass, adminSelectClass } from "./admin-workflow-ui";
import { ADMIN_ADMISSIONS, ADMIN_CLASSES, ADMIN_STUDENT_GRADES } from "./admin-entities-data";

function WorkflowStep({
  done,
  active,
  label,
}: {
  done: boolean;
  active: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        done ? "bg-green/15 text-green" : active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}

export function AdminAdmissionDetail({ admissionId }: { admissionId: string }) {
  const loading = usePageLoading(300);
  const fallback = ADMIN_ADMISSIONS.find((a) => a.id === admissionId);
  const { data: admission, isFetching } = useAdmission(admissionId, fallback);
  const { data: admissionConfig = createDefaultAdmissionConfig() } = useAdmissionConfig();
  const updateAdmission = useUpdateAdmission(admissionId);
  const { data: classes = ADMIN_CLASSES } = useClassesList(ADMIN_CLASSES);

  const active = admission ?? fallback;

  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("09:00");
  const [venue, setVenue] = useState("");
  const [examScore, setExamScore] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [credentials, setCredentials] = useState<{ email: string; password: string; studentId: string } | null>(
    null,
  );

  const sectionsForGrade = useMemo(() => {
    if (!grade) return [];
    return classes.filter((c) => c.grade === grade).map((c) => `${grade}-${c.section}`);
  }, [classes, grade]);

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!active) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Application not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/admissions">Back to admissions</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const currentGrade = grade || (active.institutionType === "secondary" ? parseGradeNumber(active.gradeApplied) : "10");
  const currentClass = className || sectionsForGrade[0] || `${currentGrade}-A`;

  const subjects = examSubjectsFor(active.institutionType, admissionConfig);
  const isPaid = active.paymentStatus === "paid";
  const inDocReview = active.status === "documents_review" || active.status === "paid";
  const canScheduleExam = active.status === "exam_eligible";
  const canPublishResults = active.status === "exam_completed";
  const canDepartmentReview = active.status === "results_published";
  const canDepartmentApprove = active.status === "department_review";
  const canAddStudent = active.status === "approved" && !active.studentId;
  const canReject = !["rejected", "enrolled", "screening_rejected"].includes(active.status);

  const onMarkPaid = async () => {
    await updateAdmission.mutateAsync({ action: "pay" });
  };

  const onVetDocument = async (requirementId: string, documentStatus: "approved" | "rejected") => {
    await updateAdmission.mutateAsync({ action: "vet_document", requirementId, documentStatus });
  };

  const onPassScreening = async () => {
    await updateAdmission.mutateAsync({ action: "pass_screening", screeningNotes: reviewNotes || undefined });
  };

  const onFailScreening = async () => {
    await updateAdmission.mutateAsync({ action: "fail_screening", screeningNotes: reviewNotes || undefined });
  };

  const onScheduleExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const setup: AdmissionExamSetup = {
      examDate,
      examTime,
      venue,
      subjects,
      instructions: "Arrive 30 minutes early with your printed slip and a valid ID.",
      onlineExamEnabled: true,
    };
    await updateAdmission.mutateAsync({ action: "schedule_exam", examSetup: setup });
  };

  const onPublishResults = async () => {
    await updateAdmission.mutateAsync({ action: "publish_results" });
  };

  const onSendDepartment = async () => {
    await updateAdmission.mutateAsync({ action: "department_review" });
  };

  const onDepartmentApprove = async () => {
    await updateAdmission.mutateAsync({ action: "department_approve", departmentNotes: reviewNotes || undefined });
  };

  const onCompleteExam = async () => {
    await updateAdmission.mutateAsync({ action: "complete_exam", examScore: Number(examScore) });
  };

  const onApprove = async () => {
    await updateAdmission.mutateAsync({ action: "department_approve", departmentNotes: reviewNotes || undefined });
  };

  const onReject = async () => {
    await updateAdmission.mutateAsync({ action: "reject", reviewNotes: reviewNotes || undefined });
  };

  const onAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const enrollGrade = active.institutionType === "university" || active.institutionType === "college" ? "100" : currentGrade;
    const result = await updateAdmission.mutateAsync({
      action: "add_student",
      grade: enrollGrade,
      className: currentClass,
    });
    if (result && typeof result === "object" && "student" in result && "temporaryPassword" in result) {
      setCredentials({
        email: result.student.email,
        password: result.temporaryPassword as string,
        studentId: result.student.id,
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/admissions" label="Back to admissions" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {active.institutionType === "secondary" ? <School className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                {active.institutionType === "secondary" ? "Secondary" : "University"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{active.reference}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold">{active.applicantName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{active.gradeApplied}</p>
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                ADMISSION_STATUS_STYLES[active.status],
              )}
            >
              {ADMISSION_STATUS_LABELS[active.status]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkflowStep done={isPaid} active={!isPaid} label="Payment" />
            <WorkflowStep done={["exam_eligible", "exam_scheduled", "exam_completed", "results_published", "department_review", "approved", "enrolled"].includes(active.status)} active={inDocReview} label="Screening" />
            <WorkflowStep done={["exam_completed", "results_published", "department_review", "approved", "enrolled"].includes(active.status)} active={active.status === "exam_scheduled"} label="Exam" />
            <WorkflowStep done={active.status === "approved" || active.status === "enrolled"} active={canDepartmentApprove} label="Department" />
            <WorkflowStep done={active.status === "enrolled"} active={canAddStudent} label="Student" />
          </div>
        </div>
      </ManagementPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Applicant details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{active.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{active.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Guardian</dt>
              <dd className="font-medium">{active.guardian}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Submitted</dt>
              <dd className="font-medium">{active.submittedDate}</dd>
            </div>
          </dl>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">Application fee</h2>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{formatAdmissionFee(active.paymentAmount)}</p>
          <p className="mt-1 text-sm capitalize text-muted-foreground">Payment: {active.paymentStatus}</p>
          {active.paymentReference ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">{active.paymentReference}</p>
          ) : null}
          {active.paymentStatus !== "paid" ? (
            <Button
              onClick={onMarkPaid}
              disabled={updateAdmission.isPending}
              className="mt-4 h-10 rounded-xl bg-primary text-primary-foreground"
            >
              Mark as paid
            </Button>
          ) : null}
        </ManagementPanel>
      </div>

      {(active.documents.length > 0 || inDocReview) ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Document vetting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve uploads before exam eligibility. Screening rules are configured in admission settings.
          </p>
          {active.documents.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Awaiting document uploads from applicant.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {active.documents.map((doc) => {
                const req = admissionConfig.requiredDocuments.find((r) => r.id === doc.requirementId);
                return (
                  <li key={doc.requirementId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
                    <div>
                      <p className="font-semibold">{req?.label ?? doc.requirementId}</p>
                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", doc.status === "approved" ? "bg-green/15 text-green" : doc.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground")}>{doc.status}</span>
                      {doc.status === "pending" ? (
                        <>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => void onVetDocument(doc.requirementId, "approved")}>Approve</Button>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => void onVetDocument(doc.requirementId, "rejected")}>Reject</Button>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {active.status === "documents_review" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={onPassScreening} className="h-9 rounded-xl bg-green text-white">Pass screening</Button>
              <Button onClick={onFailScreening} variant="outline" className="h-9 rounded-xl">Fail screening</Button>
            </div>
          ) : null}
        </ManagementPanel>
      ) : null}

      {canScheduleExam ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Examination setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Subjects: {subjects.join(", ")}
          </p>
          <form onSubmit={onScheduleExam} className="mt-4 grid gap-4 sm:grid-cols-2">
            <AdminFormField label="Exam date">
              <input required type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Exam time">
              <input required type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Venue" className="sm:col-span-2">
              <input required value={venue} onChange={(e) => setVenue(e.target.value)} className={adminInputClass} placeholder="Hall / faculty room" />
            </AdminFormField>
            <Button type="submit" disabled={updateAdmission.isPending} className="h-10 rounded-xl bg-primary text-primary-foreground sm:col-span-2">
              Schedule examination
            </Button>
          </form>
        </ManagementPanel>
      ) : null}

      {active.examSetup ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Exam slip</h2>
          <AdmissionPrintSlip admission={active} />
        </ManagementPanel>
      ) : null}

      {active.examSetup && active.status === "exam_scheduled" ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Online CBT exam</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Applicant writes the exam at{" "}
            <Link href={`/admissions/exam/${encodeURIComponent(active.reference)}`} className="font-semibold text-primary hover:underline" target="_blank">
              /admissions/exam/{active.reference}
            </Link>
          </p>
        </ManagementPanel>
      ) : null}

      {canPublishResults ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Exam results</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Score: <strong>{active.examScore ?? "—"}%</strong> · Passing: {admissionConfig.examPassingScore}%
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onPublishResults} className="h-10 rounded-xl bg-primary text-primary-foreground">Publish results to applicant</Button>
            {!active.examScore ? (
              <>
                <AdminFormField label="Manual score (%)">
                  <input type="number" value={examScore} onChange={(e) => setExamScore(e.target.value)} className={adminInputClass} />
                </AdminFormField>
                <Button onClick={onCompleteExam} disabled={!examScore} variant="outline" className="h-10 rounded-xl">Record score</Button>
              </>
            ) : null}
          </div>
        </ManagementPanel>
      ) : null}

      {canDepartmentReview ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Send to {admissionConfig.departmentName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Department reviews results before final admission approval.</p>
          <Button onClick={onSendDepartment} className="mt-4 h-10 rounded-xl bg-primary text-primary-foreground">Send for department review</Button>
        </ManagementPanel>
      ) : null}

      {(canDepartmentApprove || canReject) && active.status !== "approved" ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">{admissionConfig.departmentName} decision</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Final approval does not create a student account — use Add as student after approval.
          </p>
          <AdminFormField label="Notes" className="mt-4">
            <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className={cn(adminInputClass, "min-h-[80px] resize-y")} />
          </AdminFormField>
          <div className="mt-4 flex flex-wrap gap-2">
            {canDepartmentApprove ? (
              <Button onClick={onDepartmentApprove} disabled={updateAdmission.isPending} className="h-10 rounded-xl bg-green text-white hover:bg-green/90">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve admission
              </Button>
            ) : null}
            {canReject ? (
              <Button onClick={onReject} disabled={updateAdmission.isPending} variant="outline" className="h-10 rounded-xl">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            ) : null}
          </div>
        </ManagementPanel>
      ) : null}

      {canAddStudent ? (
        <ManagementPanel className="border border-border border-l-4 border-l-primary">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold">Add as student</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Creates a student record using the applicant&apos;s email. Initial password is their first name (
            <strong>{active.firstName.toLowerCase()}</strong>).
          </p>
          <form onSubmit={onAddStudent} className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.institutionType === "secondary" || active.institutionType === "primary" ? (
              <>
                <AdminFormField label="Grade">
                  <select value={currentGrade} onChange={(e) => setGrade(e.target.value)} className={adminSelectClass}>
                    {ADMIN_STUDENT_GRADES.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </AdminFormField>
                <AdminFormField label="Class">
                  <select value={currentClass} onChange={(e) => setClassName(e.target.value)} className={adminSelectClass}>
                    {(sectionsForGrade.length ? sectionsForGrade : [`${currentGrade}-A`]).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </AdminFormField>
              </>
            ) : (
              <AdminFormField label="Class / cohort" className="sm:col-span-2">
                <select value={currentClass} onChange={(e) => setClassName(e.target.value)} className={adminSelectClass}>
                  {["100-A", "100-B", "200-A", "200-B"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="grade" value="100" />
              </AdminFormField>
            )}
            <Button type="submit" disabled={updateAdmission.isPending} className="h-10 rounded-xl bg-primary text-primary-foreground sm:col-span-2">
              {updateAdmission.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create student record
            </Button>
          </form>
        </ManagementPanel>
      ) : null}

      {credentials ? (
        <ManagementPanel className="border border-green/30 bg-green/5">
          <h2 className="text-base font-bold text-green">Student credentials</h2>
          <p className="mt-2 text-sm text-muted-foreground">Share these login details with the applicant.</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-mono font-semibold">{credentials.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Password</dt>
              <dd className="font-mono font-semibold">{credentials.password}</dd>
            </div>
          </dl>
          <Button asChild className="mt-4 h-10 rounded-full bg-primary text-primary-foreground">
            <Link href={`/admin/students/${credentials.studentId}`}>View student profile</Link>
          </Button>
        </ManagementPanel>
      ) : null}

      {active.status === "enrolled" && active.studentId && !credentials ? (
        <ManagementPanel className="border border-border">
          <p className="text-sm text-muted-foreground">This applicant was enrolled on {active.enrolledAt}.</p>
          <Button asChild variant="outline" className="mt-3 h-10 rounded-full">
            <Link href={`/admin/students/${active.studentId}`}>View student profile</Link>
          </Button>
        </ManagementPanel>
      ) : null}

      {active.reviewNotes ? (
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Review notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">{active.reviewNotes}</p>
        </ManagementPanel>
      ) : null}
    </div>
  );
}
