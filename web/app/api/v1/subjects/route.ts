import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { addSubject, enrichSubject, getMutableSubjects } from "@/lib/api/subject-entity-store";
import type { SubjectRecord } from "@/components/dashboard/admin/admin-entities-data";

export async function GET(request: NextRequest) {
  const items = getMutableSubjects().map((subject) => {
    const enriched = enrichSubject(subject);
    return {
      ...subject,
      teacherCount: enriched.teacherCount,
    };
  });
  return jsonList(items, "Subjects loaded", request, ["name", "code", "department", "description"]);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<SubjectRecord>;
  if (!body.name || !body.department || body.credits === undefined) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }

  const subject = addSubject({
    code: body.code,
    name: body.name,
    description: body.description ?? "",
    credits: Number(body.credits),
    department: body.department,
    gradeLevels: body.gradeLevels ?? [],
    status: body.status ?? "active",
    assignedTeacherIds: body.assignedTeacherIds ?? [],
  });

  return jsonData(enrichSubject(subject), "Subject created", 201);
}
