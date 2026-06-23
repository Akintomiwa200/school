export { DashboardPage } from "./dashboard-page";
export { StudentDashboard } from "./student-dashboard";
export { StudentDashboardSkeleton } from "./student-dashboard-skeleton";
export { StudentCourses } from "./student-courses";
export { StudentCoursesSkeleton } from "./student-courses-skeleton";
export { StudentAssignments } from "./student-assignments";
export { StudentTimetable } from "./student-timetable";
export { StudentTimetableSkeleton } from "./timetable/student-timetable-skeleton";
export {
  StudentAttendance,
  StudentAttendanceRecord,
  StudentAttendanceMark,
  StudentAttendanceMarkSession,
  StudentAttendanceShell,
  StudentAttendanceSkeleton,
  StudentAttendanceListSkeleton,
} from "./attendance";
export {
  StudentFees,
  StudentFeesFeeDetail,
  StudentFeesPaymentDetail,
  StudentFeesInvoiceDetail,
  StudentFeesPay,
  StudentFeesPayCheckout,
  StudentFeesPayConfirmation,
  StudentFeesReceipt,
  StudentFeesShell,
  StudentFeesSkeleton,
  StudentFeesTableSkeleton,
} from "./fees";
export {
  StudentCourseShell,
  StudentCourseDetail,
  StudentCourseLessons,
  StudentCourseLesson,
  StudentCourseAssignments,
  StudentCourseAssignment,
  StudentCourseMaterials,
} from "./courses";
export { DASHBOARD_PAGE_META, getDashboardPageMeta } from "./page-meta";
export type { DashboardPageMeta, DashboardSection, DashboardStat } from "./page-meta";
