"use client";

import { StudentGradesShell } from "./student-grades-shell";
import { StudentGradesOverview } from "./student-grades-overview";
import { StudentGradesCourses } from "./student-grades-courses";
import { StudentGradesReportCards } from "./student-grades-report-cards";
import { StudentGradesTranscript } from "./student-grades-transcript";

type StudentGradesProps = {
  view: "overview" | "courses" | "report-cards" | "transcript";
  basePath?: string;
};

export function StudentGrades({ view, basePath = "/student/grades" }: StudentGradesProps) {
  return (
    <StudentGradesShell basePath={basePath}>
      {view === "overview" ? <StudentGradesOverview /> : null}
      {view === "courses" ? <StudentGradesCourses /> : null}
      {view === "report-cards" ? <StudentGradesReportCards /> : null}
      {view === "transcript" ? <StudentGradesTranscript /> : null}
    </StudentGradesShell>
  );
}

export { StudentGradesCourseDetail } from "./student-grades-course-detail";
export { StudentGradesAssessmentDetail } from "./student-grades-assessment-detail";
export { StudentGradesReportCardDetail } from "./student-grades-report-card-detail";
export { StudentGradesShell } from "./student-grades-shell";
