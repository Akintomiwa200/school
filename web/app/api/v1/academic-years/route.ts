import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import {
  addAcademicYear,
  getClassesForAcademicYear,
  getMutableAcademicYears,
} from "@/lib/api/academic-year-entity-store";

export async function GET(request: NextRequest) {
  const years = getMutableAcademicYears().map((year) => ({
    ...year,
    classCount: getClassesForAcademicYear(year.id).length,
  }));
  return jsonList(years, "Academic years loaded", request, ["name"]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.startDate || !body.endDate) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }

  const year = addAcademicYear({
    name: String(body.name),
    startDate: String(body.startDate),
    endDate: String(body.endDate),
    termCount: body.termCount ? Number(body.termCount) : 3,
  });

  return jsonData(
    { ...year, classCount: getClassesForAcademicYear(year.id).length },
    "Academic year created",
    201,
  );
}
