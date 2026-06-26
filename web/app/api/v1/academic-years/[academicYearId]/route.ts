import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  addTerm,
  getAcademicYearById,
  getClassesForAcademicYear,
  setActiveTerm,
  setCurrentAcademicYear,
  updateAcademicYear,
  updateTerm,
} from "@/lib/api/academic-year-entity-store";
import type { AcademicYearRecord, TermRecord } from "@/components/dashboard/admin/admin-entities-data";

type RouteContext = { params: Promise<{ academicYearId: string }> };

export type AcademicYearDetailResponse = AcademicYearRecord & { classCount: number };

function withClassCount(year: AcademicYearRecord): AcademicYearDetailResponse {
  return { ...year, classCount: getClassesForAcademicYear(year.id).length };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { academicYearId } = await context.params;
  const year = getAcademicYearById(academicYearId);
  if (!year) {
    return NextResponse.json(createApiError("not_found", "Academic year not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(withClassCount(year), "Academic year loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { academicYearId } = await context.params;
  const body = (await request.json()) as Partial<AcademicYearRecord> & {
    action?: "set_current" | "add_term" | "update_term" | "set_active_term";
    term?: Partial<TermRecord> & { name: string; startDate: string; endDate: string };
    termId?: string;
  };

  if (body.action === "set_current") {
    const updated = setCurrentAcademicYear(academicYearId);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Academic year not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(withClassCount(updated), "Academic year set as current"));
  }

  if (body.action === "add_term" && body.term) {
    const updated = addTerm(academicYearId, {
      name: body.term.name,
      startDate: body.term.startDate,
      endDate: body.term.endDate,
      status: body.term.status,
    });
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Academic year not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(withClassCount(updated), "Term added"));
  }

  if (body.action === "update_term" && body.termId && body.term) {
    const updated = updateTerm(academicYearId, body.termId, body.term);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Academic year or term not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(withClassCount(updated), "Term updated"));
  }

  if (body.action === "set_active_term" && body.termId) {
    const updated = setActiveTerm(academicYearId, body.termId);
    if (!updated) {
      return NextResponse.json(createApiError("not_found", "Academic year or term not found"), { status: 404 });
    }
    return NextResponse.json(createApiResponse(withClassCount(updated), "Active term updated"));
  }

  const { action: _action, term: _term, termId: _termId, ...patch } = body;
  const updated = updateAcademicYear(academicYearId, patch);
  if (!updated) {
    return NextResponse.json(createApiError("not_found", "Academic year not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(withClassCount(updated), "Academic year updated"));
}
