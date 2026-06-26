import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  getAdmissionByReference,
  startOnlineExam,
  submitOnlineExam,
} from "@/lib/api/admin-entity-store";
import { getAdmissionConfig } from "@/lib/api/admission-config-store";
import { buildDemoExamQuestions } from "@/components/admissions/admissions-workflow-data";

type RouteContext = { params: Promise<{ reference: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { reference } = await context.params;
  const admission = getAdmissionByReference(decodeURIComponent(reference));
  if (!admission) {
    return NextResponse.json(createApiError("not_found", "Application not found"), { status: 404 });
  }
  const config = getAdmissionConfig();
  const questions = buildDemoExamQuestions(config).map(({ id, subject, question, options }) => ({
    id,
    subject,
    question,
    options,
  }));
  return NextResponse.json(
    createApiResponse(
      {
        admission: {
          reference: admission.reference,
          applicantName: admission.applicantName,
          status: admission.status,
          examStatus: admission.examStatus,
          examSetup: admission.examSetup,
          examScore: admission.examScore,
        },
        config: {
          durationMinutes: config.examDurationMinutes,
          subjects: config.examSubjects,
          passingScore: config.examPassingScore,
        },
        questions,
      },
      "Exam session loaded",
    ),
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { reference } = await context.params;
  const admission = getAdmissionByReference(decodeURIComponent(reference));
  if (!admission) {
    return NextResponse.json(createApiError("not_found", "Application not found"), { status: 404 });
  }

  const body = (await request.json()) as { action?: "start" | "submit"; answers?: Record<string, number> };

  if (body.action === "start") {
    const updated = startOnlineExam(admission.id);
    return updated
      ? NextResponse.json(createApiResponse(updated, "Exam started"))
      : NextResponse.json(createApiError("not_found", "Exam not available"), { status: 404 });
  }

  if (body.action === "submit" && body.answers) {
    const updated = submitOnlineExam(admission.id, body.answers);
    return updated
      ? NextResponse.json(createApiResponse(updated, "Exam submitted"))
      : NextResponse.json(createApiError("not_found", "Cannot submit exam"), { status: 404 });
  }

  return NextResponse.json(createApiError("validation", "Invalid action"), { status: 400 });
}
