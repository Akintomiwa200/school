import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import {
  CURRENT_TERM_ID,
  CURRENT_TERM_LABEL,
  getAllAssessments,
  getCourseGrades,
  getGradeStats,
  getReportCards,
  getTranscript,
} from "@/components/dashboard/grades/student-grades-data";

export async function GET(_request: NextRequest) {
  const stats = getGradeStats();

  return NextResponse.json(
    createApiResponse(
      {
        term: { id: CURRENT_TERM_ID, label: CURRENT_TERM_LABEL },
        stats,
        courseGrades: getCourseGrades(),
        assessments: getAllAssessments(),
        reportCards: getReportCards(),
        transcript: getTranscript(),
      },
      "Grades loaded",
    ),
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(createApiResponse(body, "grades endpoint - POST"), { status: 201 });
}
