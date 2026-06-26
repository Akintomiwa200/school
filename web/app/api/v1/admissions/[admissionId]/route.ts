import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  addAdmissionAsStudent,
  approveAdmission,
  approveDepartmentAdmission,
  completeAdmissionExam,
  failAdmissionScreening,
  getAdmissionById,
  passAdmissionScreening,
  publishAdmissionResults,
  recordAdmissionPayment,
  rejectAdmission,
  scheduleAdmissionExam,
  sendToDepartmentReview,
  startOnlineExam,
  submitAdmissionDocuments,
  submitOnlineExam,
  updateAdmission,
  vetAdmissionDocument,
} from "@/lib/api/admin-entity-store";
import type { AdmissionExamSetup, AdmissionRecord, UploadedAdmissionDocument } from "@/components/admissions/admissions-workflow-data";

type RouteContext = { params: Promise<{ admissionId: string }> };

type PatchBody = Partial<AdmissionRecord> & {
  action?:
    | "pay"
    | "submit_documents"
    | "vet_document"
    | "pass_screening"
    | "fail_screening"
    | "schedule_exam"
    | "start_exam"
    | "submit_exam"
    | "publish_results"
    | "department_review"
    | "department_approve"
    | "approve"
    | "reject"
    | "add_student"
    | "enroll"
    | "complete_exam";
  documents?: UploadedAdmissionDocument[];
  requirementId?: string;
  documentStatus?: "approved" | "rejected";
  reviewNote?: string;
  examSetup?: AdmissionExamSetup;
  examScore?: number;
  examAnswers?: Record<string, number>;
  reviewNotes?: string;
  screeningNotes?: string;
  departmentNotes?: string;
  grade?: string;
  className?: string;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { admissionId } = await context.params;
  const admission = getAdmissionById(admissionId);
  if (!admission) {
    return NextResponse.json(createApiError("not_found", "Admission not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(admission, "Admission loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { admissionId } = await context.params;
  const body = (await request.json()) as PatchBody;

  const handlers: Record<string, () => NextResponse | null> = {
    pay: () => {
      const updated = recordAdmissionPayment(admissionId);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Payment recorded"))
        : NextResponse.json(createApiError("not_found", "Payment failed"), { status: 404 });
    },
    submit_documents: () => {
      if (!body.documents?.length) {
        return NextResponse.json(createApiError("validation", "Documents required"), { status: 400 });
      }
      const updated = submitAdmissionDocuments(admissionId, body.documents);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Documents submitted"))
        : NextResponse.json(createApiError("not_found", "Cannot submit documents"), { status: 404 });
    },
    vet_document: () => {
      if (!body.requirementId || !body.documentStatus) {
        return NextResponse.json(createApiError("validation", "Document vetting fields required"), { status: 400 });
      }
      const updated = vetAdmissionDocument(admissionId, body.requirementId, body.documentStatus, body.reviewNote);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Document reviewed"))
        : NextResponse.json(createApiError("not_found", "Document not found"), { status: 404 });
    },
    pass_screening: () => {
      const updated = passAdmissionScreening(admissionId, body.screeningNotes);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Screening passed"))
        : NextResponse.json(createApiError("not_found", "Cannot pass screening"), { status: 404 });
    },
    fail_screening: () => {
      const updated = failAdmissionScreening(admissionId, body.screeningNotes);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Screening failed"))
        : NextResponse.json(createApiError("not_found", "Admission not found"), { status: 404 });
    },
    schedule_exam: () => {
      if (!body.examSetup) {
        return NextResponse.json(createApiError("validation", "Exam setup required"), { status: 400 });
      }
      const updated = scheduleAdmissionExam(admissionId, body.examSetup);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Exam scheduled"))
        : NextResponse.json(createApiError("not_found", "Cannot schedule exam"), { status: 404 });
    },
    start_exam: () => {
      const updated = startOnlineExam(admissionId);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Exam started"))
        : NextResponse.json(createApiError("not_found", "Cannot start exam"), { status: 404 });
    },
    submit_exam: () => {
      if (!body.examAnswers) {
        return NextResponse.json(createApiError("validation", "Exam answers required"), { status: 400 });
      }
      const updated = submitOnlineExam(admissionId, body.examAnswers);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Exam submitted"))
        : NextResponse.json(createApiError("not_found", "Cannot submit exam"), { status: 404 });
    },
    publish_results: () => {
      const updated = publishAdmissionResults(admissionId);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Results published"))
        : NextResponse.json(createApiError("not_found", "Cannot publish results"), { status: 404 });
    },
    department_review: () => {
      const updated = sendToDepartmentReview(admissionId);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Sent to department"))
        : NextResponse.json(createApiError("not_found", "Cannot send to department"), { status: 404 });
    },
    department_approve: () => {
      const updated = approveDepartmentAdmission(admissionId, body.departmentNotes);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Department approved"))
        : NextResponse.json(createApiError("not_found", "Cannot approve"), { status: 404 });
    },
    approve: () => {
      const updated = approveAdmission(admissionId, body.reviewNotes);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Application approved"))
        : NextResponse.json(createApiError("not_found", "Cannot approve"), { status: 404 });
    },
    reject: () => {
      const updated = rejectAdmission(admissionId, body.reviewNotes);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Application rejected"))
        : NextResponse.json(createApiError("not_found", "Admission not found"), { status: 404 });
    },
    complete_exam: () => {
      const score = Number(body.examScore);
      if (Number.isNaN(score)) {
        return NextResponse.json(createApiError("validation", "Score required"), { status: 400 });
      }
      const updated = completeAdmissionExam(admissionId, score);
      return updated
        ? NextResponse.json(createApiResponse(updated, "Exam complete"))
        : NextResponse.json(createApiError("not_found", "Cannot complete exam"), { status: 404 });
    },
    add_student: () => {
      if (!body.grade || !body.className) {
        return NextResponse.json(createApiError("validation", "Grade and class required"), { status: 400 });
      }
      const result = addAdmissionAsStudent(admissionId, { grade: body.grade, className: body.className });
      return result
        ? NextResponse.json(createApiResponse(result, "Student created"))
        : NextResponse.json(createApiError("not_found", "Must be approved first"), { status: 404 });
    },
    enroll: () => {
      if (!body.grade || !body.className) {
        return NextResponse.json(createApiError("validation", "Grade and class required"), { status: 400 });
      }
      const result = addAdmissionAsStudent(admissionId, { grade: body.grade, className: body.className });
      return result
        ? NextResponse.json(createApiResponse(result, "Student created"))
        : NextResponse.json(createApiError("not_found", "Must be approved first"), { status: 404 });
    },
  };

  if (body.action && handlers[body.action]) {
    const response = handlers[body.action]();
    if (response) return response;
  }

  const updated = updateAdmission(admissionId, body);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Admission not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(updated, "Admission updated"));
}
