import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { addClass, getMutableClasses } from "@/lib/api/admin-entity-store";
import { getCurrentAcademicYear } from "@/lib/api/academic-year-entity-store";

export async function GET(request: NextRequest) {
  return jsonList(getMutableClasses(), "Classes loaded", request, [
    "name",
    "grade",
    "section",
    "homeroomTeacher",
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.grade || !body.section || !body.homeroomTeacher || !body.capacity) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }
  const classRecord = addClass({
    grade: String(body.grade),
    section: String(body.section),
    homeroomTeacher: String(body.homeroomTeacher),
    capacity: Number(body.capacity),
    academicYearId: body.academicYearId ? String(body.academicYearId) : getCurrentAcademicYear()?.id,
  });
  return jsonData(classRecord, "Class created", 201);
}
