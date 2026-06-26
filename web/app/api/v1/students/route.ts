import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { addStudent, getMutableStudents } from "@/lib/api/admin-entity-store";
import type { StudentRecord } from "@/components/dashboard/admin/admin-entities-data";

export async function GET(request: NextRequest) {
  return jsonList(getMutableStudents(), "Students loaded", request, [
    "name",
    "studentId",
    "className",
    "guardian",
    "email",
  ]);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<StudentRecord>;
  if (!body.name || !body.grade || !body.className || !body.guardian || !body.email) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }
  const student = addStudent({
    name: body.name,
    grade: body.grade,
    className: body.className,
    guardian: body.guardian,
    email: body.email,
    status: body.status ?? "active",
    enrolledDate: body.enrolledDate ?? new Date().toISOString().slice(0, 10),
    studentId: body.studentId,
  });
  return jsonData(student, "Student created", 201);
}
