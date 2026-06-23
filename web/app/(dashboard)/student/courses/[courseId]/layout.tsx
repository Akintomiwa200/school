import { StudentCourseShell } from "@/components/dashboard";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <StudentCourseShell>{children}</StudentCourseShell>;
}
