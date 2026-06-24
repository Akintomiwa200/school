"use client";

import { StudentGrades } from "./student-grades";

export function ParentGrades({
  view = "overview",
}: {
  view?: "overview" | "courses" | "report-cards" | "transcript";
}) {
  return <StudentGrades view={view} basePath="/parent/grades" />;
}
