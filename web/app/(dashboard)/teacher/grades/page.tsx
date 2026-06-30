import { Suspense } from "react";
import { TeacherGrades } from "@/components/dashboard";
import { StudentGradesListSkeleton } from "@/components/dashboard/grades/student-grades-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<StudentGradesListSkeleton />}>
      <TeacherGrades />
    </Suspense>
  );
}
