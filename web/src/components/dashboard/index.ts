export { DashboardPage } from "./dashboard-page";
export { AdminDashboard, AdminSectionPage } from "./admin";
export {
  AdminStudents,
  AdminStaff,
  AdminClasses,
  AdminSubjects,
  AdminAcademicYears,
  AdminAdmissions,
  AdminReports,
} from "./admin";
export { SuperAdminDashboard, SuperAdminSectionPage } from "./super-admin";
export { SuperAdminSchools, SuperAdminUsers, SuperAdminAudit } from "./super-admin";
export {
  AccountantDashboard,
  AccountantFees,
  AccountantPayments,
  AccountantPaymentDetail,
  AccountantExpenses,
  AccountantInvoices,
  AccountantInvoiceDetail,
  AccountantPayroll,
  AccountantAudit,
  AccountantReports,
} from "./accountant";
export {
  TeacherDashboard,
  TeacherClasses,
  TeacherCourses,
  TeacherAttendance,
  TeacherAssignments,
  TeacherMaterials,
  TeacherTimetable,
} from "./teacher";
export { HrDashboard, HrEmployees, HrLeave, HrRecruitment } from "./hr";
export { StaffDashboard, StaffTransport, StaffHostel, StaffInventory, StaffAttendance } from "./staff";
export { LibrarianDashboard, LibrarianBooks, LibrarianIssues } from "./librarian";
export { ReceptionistDashboard, ReceptionistAdmissions, ReceptionistVisitors } from "./receptionist";
export { ParentDashboard, ParentChildren, ParentFees, ParentAttendance } from "./parent";
export { SharedLeave } from "./leave";
export { SharedSupport } from "./support";
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
export { StudentMessages } from "./messages";
export { SharedEvents } from "./events";
export { SharedCalendar } from "./calendar";
export { SharedProfile, StudentProfile } from "./profile";
export { SharedSettings } from "./settings";
export { SharedNotifications, RealtimeNotificationsBridge } from "./notifications";
export { SharedAnnouncements, SharedAnnouncementDetail } from "./announcements";
export {
  SharedOnlineClasses,
  StudentOnlineClasses,
  StudentOnlineClassesLayout,
  OnlineClassDetail,
  OnlineClassLiveRoom,
  OnlineClassRecording,
  OnlineClassWaiting,
  OnlineClassesStreamBridge,
} from "./online-classes";
export {
  StudentLibrary,
  StudentLibraryShell,
  StudentLibraryBooks,
  StudentLibraryBookDetail,
  StudentLibraryReader,
  StudentLibraryMyBooks,
  StudentLibraryShop,
  StudentLibraryShopItem,
  StudentLibraryAchievements,
  StudentLibraryOrders,
  StudentLibraryOrderDetail,
  StudentLibraryReceipt,
  StudentLibraryPay,
  StudentLibraryPayCheckout,
  StudentLibraryPayConfirmation,
  LibrarySkeleton,
  LibraryListSkeleton,
  LibraryDetailSkeleton,
} from "./library";
export {
  StudentGrades,
  StudentGradesCourseDetail,
  StudentGradesAssessmentDetail,
  StudentGradesReportCardDetail,
  StudentGradesShell,
  ParentGrades,
  TeacherGrades,
} from "./grades";
export { DASHBOARD_PAGE_META, getDashboardPageMeta } from "./page-meta";
export type { DashboardPageMeta, DashboardSection, DashboardStat } from "./page-meta";
