import type { LucideIcon } from "lucide-react";

export type DashboardStat = {
  label: string;
  value: string;
  hint?: string;
};

export type DashboardSection = {
  title: string;
  description: string;
};

export type DashboardPageMeta = {
  title: string;
  description: string;
  stats?: DashboardStat[];
  sections?: DashboardSection[];
};

export const DASHBOARD_PAGE_META: Record<string, DashboardPageMeta> = {
  "/super-admin": {
    title: "Super Admin Dashboard",
    description: "Platform-wide overview across schools, users, and system health.",
    stats: [
      { label: "Schools", value: "—", hint: "Connected institutions" },
      { label: "Users", value: "—", hint: "All platform accounts" },
      { label: "Audit events", value: "—", hint: "Last 30 days" },
    ],
  },
  "/super-admin/schools": {
    title: "Schools",
    description: "Manage schools connected to the platform.",
    sections: [
      { title: "School directory", description: "View and configure each school tenant." },
      { title: "Provisioning", description: "Onboard new schools and assign admins." },
    ],
  },
  "/super-admin/users": {
    title: "Users",
    description: "Global user accounts across all schools and roles.",
    sections: [
      { title: "Account search", description: "Find users by email, role, or school." },
      { title: "Access control", description: "Suspend, restore, or reset accounts." },
    ],
  },
  "/super-admin/settings": {
    title: "Platform Settings",
    description: "System-wide configuration for Pathway Academy.",
    sections: [
      { title: "Branding", description: "Logo, colors, and public site defaults." },
      { title: "Integrations", description: "Email, payments, and third-party services." },
    ],
  },
  "/super-admin/audit": {
    title: "Audit Logs",
    description: "Security and activity trail for super admin actions.",
    sections: [
      { title: "Event log", description: "Filter by user, action, and date range." },
      { title: "Exports", description: "Download audit reports for compliance." },
    ],
  },

  "/admin": {
    title: "Admin Dashboard",
    description: "School operations overview — students, staff, classes, and admissions.",
    stats: [
      { label: "Students", value: "—", hint: "Enrolled learners" },
      { label: "Staff", value: "—", hint: "Teachers & employees" },
      { label: "Classes", value: "—", hint: "Active sections" },
    ],
  },
  "/admin/students": {
    title: "Students",
    description: "Enroll, update, and manage student records.",
    sections: [
      { title: "Student list", description: "Search, filter, and export student data." },
      { title: "Enrollment", description: "Assign classes and guardians." },
    ],
  },
  "/admin/staff": {
    title: "Staff",
    description: "Manage teachers and non-teaching employees.",
    sections: [
      { title: "Staff directory", description: "Roles, departments, and contact info." },
      { title: "Assignments", description: "Link staff to classes and subjects." },
    ],
  },
  "/admin/classes": {
    title: "Classes",
    description: "Grade levels, sections, and class capacity.",
    sections: [
      { title: "Class list", description: "Create and organize class groups." },
      { title: "Rosters", description: "Assign students and homeroom teachers." },
    ],
  },
  "/admin/subjects": {
    title: "Subjects",
    description: "Curriculum subjects offered across the school.",
    sections: [
      { title: "Subject catalog", description: "Codes, credits, and descriptions." },
      { title: "Mappings", description: "Link subjects to classes and teachers." },
    ],
  },
  "/admin/academic-years": {
    title: "Academic Years",
    description: "Terms, sessions, and the active academic calendar.",
    sections: [
      { title: "Year setup", description: "Define start/end dates and terms." },
      { title: "Current year", description: "Set which year is active school-wide." },
    ],
  },
  "/admin/admissions": {
    title: "Admissions",
    description: "Review applications and manage enrollment pipeline.",
    sections: [
      { title: "Applications", description: "Pending, approved, and rejected requests." },
      { title: "Intake forms", description: "Customize admission requirements." },
    ],
  },
  "/admin/reports": {
    title: "Reports",
    description: "Analytics on attendance, performance, and operations.",
    sections: [
      { title: "Standard reports", description: "Pre-built school-wide summaries." },
      { title: "Custom exports", description: "CSV and PDF downloads." },
    ],
  },
  "/admin/settings": {
    title: "School Settings",
    description: "Configure this school's profile and preferences.",
    sections: [
      { title: "School profile", description: "Name, address, and contact details." },
      { title: "Notifications", description: "Email and alert defaults." },
    ],
  },

  "/accountant": {
    title: "Finance Dashboard",
    description: "Fees, payments, payroll, and expense overview.",
    stats: [
      { label: "Collected", value: "—", hint: "This term" },
      { label: "Outstanding", value: "—", hint: "Unpaid balances" },
      { label: "Expenses", value: "—", hint: "This month" },
    ],
  },
  "/accountant/fees": {
    title: "Fee Structure",
    description: "Define fee types, amounts, and billing schedules.",
    sections: [
      { title: "Fee plans", description: "Tuition, transport, and misc charges." },
      { title: "Class mapping", description: "Apply fees by grade or program." },
    ],
  },
  "/accountant/payments": {
    title: "Payments",
    description: "Record and reconcile fee payments.",
    sections: [
      { title: "Payment ledger", description: "Cash, card, and transfer entries." },
      { title: "Receipts", description: "Generate and resend receipts." },
    ],
  },
  "/accountant/expenses": {
    title: "Expenses",
    description: "Track school spending and approvals.",
    sections: [
      { title: "Expense entries", description: "Categories, vendors, and amounts." },
      { title: "Approvals", description: "Pending and approved requests." },
    ],
  },
  "/accountant/invoices": {
    title: "Invoices",
    description: "Issue and manage student fee invoices.",
    sections: [
      { title: "Invoice list", description: "Draft, sent, paid, and overdue." },
      { title: "Bulk billing", description: "Generate invoices by class or term." },
    ],
  },
  "/accountant/payroll": {
    title: "Payroll",
    description: "Staff salary runs and payslips.",
    sections: [
      { title: "Pay runs", description: "Monthly payroll processing." },
      { title: "Payslips", description: "Download and distribute to staff." },
    ],
  },
  "/accountant/audit": {
    title: "Finance Audit",
    description: "Financial audit trail and reconciliation.",
    sections: [
      { title: "Transaction log", description: "Immutable finance activity history." },
      { title: "Reconciliation", description: "Match payments to invoices." },
    ],
  },
  "/accountant/reports": {
    title: "Finance Reports",
    description: "Revenue, collections, and expense summaries.",
    sections: [
      { title: "Collections", description: "Fee collection by period." },
      { title: "Statements", description: "Balance and cash-flow views." },
    ],
  },

  "/teacher": {
    title: "Teacher Dashboard",
    description: "Your classes, assignments, and teaching schedule.",
    stats: [
      { label: "Classes", value: "—", hint: "Assigned sections" },
      { label: "Assignments", value: "—", hint: "Active tasks" },
      { label: "Students", value: "—", hint: "Under your care" },
    ],
  },
  "/teacher/classes": {
    title: "My Classes",
    description: "Classes and sections you teach.",
    sections: [
      { title: "Class roster", description: "Students per section." },
      { title: "Class resources", description: "Shared materials per class." },
    ],
  },
  "/teacher/courses": {
    title: "Courses",
    description: "Course content and lesson plans.",
    sections: [
      { title: "Course list", description: "Subjects you deliver." },
      { title: "Modules", description: "Units, topics, and outcomes." },
    ],
  },
  "/teacher/attendance": {
    title: "Attendance",
    description: "Mark and review daily class attendance.",
    sections: [
      { title: "Mark attendance", description: "Today's sessions." },
      { title: "History", description: "Past attendance records." },
    ],
  },
  "/teacher/assignments": {
    title: "Assignments",
    description: "Create homework and collect submissions.",
    sections: [
      { title: "Active assignments", description: "Due dates and submission status." },
      { title: "Grading queue", description: "Work awaiting review." },
    ],
  },
  "/teacher/grades": {
    title: "Grades",
    description: "Record and publish student grades.",
    sections: [
      { title: "Gradebook", description: "Scores by student and assessment." },
      { title: "Report cards", description: "Term summaries." },
    ],
  },
  "/teacher/materials": {
    title: "Materials",
    description: "Upload and share learning resources.",
    sections: [
      { title: "File library", description: "Documents, slides, and links." },
      { title: "Distribution", description: "Share with specific classes." },
    ],
  },
  "/teacher/timetable": {
    title: "Timetable",
    description: "Your weekly teaching schedule.",
    sections: [
      { title: "Week view", description: "Periods, rooms, and subjects." },
      { title: "Substitutions", description: "Cover and swap requests." },
    ],
  },

  "/staff": {
    title: "Staff Dashboard",
    description: "Operations overview for non-teaching staff.",
    stats: [
      { label: "Transport", value: "—", hint: "Active routes" },
      { label: "Hostel", value: "—", hint: "Occupied beds" },
      { label: "Inventory", value: "—", hint: "Stock items" },
    ],
  },
  "/staff/attendance": {
    title: "Staff Attendance",
    description: "Mark attendance for transport, hostel, or general duties.",
    sections: [
      { title: "Daily check-in", description: "Record presence for assigned groups." },
      { title: "Reports", description: "Attendance summaries." },
    ],
  },
  "/staff/transport": {
    title: "Transport",
    description: "Bus routes, drivers, and student pickups.",
    sections: [
      { title: "Routes", description: "Stops, timings, and capacity." },
      { title: "Assignments", description: "Students per route." },
    ],
  },
  "/staff/hostel": {
    title: "Hostel",
    description: "Boarding rooms, allocations, and maintenance.",
    sections: [
      { title: "Rooms", description: "Beds and occupancy." },
      { title: "Residents", description: "Student hostel assignments." },
    ],
  },
  "/staff/inventory": {
    title: "Inventory",
    description: "School supplies and asset tracking.",
    sections: [
      { title: "Stock list", description: "Items, quantities, and locations." },
      { title: "Requests", description: "Issue and reorder workflow." },
    ],
  },

  "/librarian": {
    title: "Library Dashboard",
    description: "Catalog, circulation, and overdue overview.",
    stats: [
      { label: "Books", value: "—", hint: "In catalog" },
      { label: "Issued", value: "—", hint: "Currently borrowed" },
      { label: "Overdue", value: "—", hint: "Needs follow-up" },
    ],
  },
  "/librarian/books": {
    title: "Books",
    description: "Manage the library catalog.",
    sections: [
      { title: "Catalog", description: "Add, edit, and categorize books." },
      { title: "Availability", description: "Copies on shelf vs issued." },
    ],
  },
  "/librarian/issues": {
    title: "Issues & Returns",
    description: "Lend and receive books from students and staff.",
    sections: [
      { title: "Issue book", description: "Check out to a borrower." },
      { title: "Returns", description: "Process returns and fines." },
    ],
  },

  "/hr": {
    title: "HR Dashboard",
    description: "Employees, leave, and recruitment at a glance.",
    stats: [
      { label: "Employees", value: "—", hint: "Active staff" },
      { label: "On leave", value: "—", hint: "Today" },
      { label: "Open roles", value: "—", hint: "Recruitment" },
    ],
  },
  "/hr/employees": {
    title: "Employees",
    description: "HR records for all school employees.",
    sections: [
      { title: "Employee directory", description: "Contracts, roles, and departments." },
      { title: "Documents", description: "IDs, certificates, and contracts." },
    ],
  },
  "/hr/leave": {
    title: "Leave Management",
    description: "Approve and track staff leave requests.",
    sections: [
      { title: "Pending requests", description: "Requests awaiting approval." },
      { title: "Leave balances", description: "Annual and sick leave totals." },
    ],
  },
  "/hr/recruitment": {
    title: "Recruitment",
    description: "Job postings and applicant pipeline.",
    sections: [
      { title: "Open positions", description: "Active job listings." },
      { title: "Applicants", description: "Review and shortlist candidates." },
    ],
  },

  "/receptionist": {
    title: "Reception Dashboard",
    description: "Front desk — admissions, visitors, and support intake.",
    stats: [
      { label: "Visitors today", value: "—", hint: "Checked in" },
      { label: "Applications", value: "—", hint: "Pending review" },
      { label: "Tickets", value: "—", hint: "Open support" },
    ],
  },
  "/receptionist/admissions": {
    title: "Admissions Desk",
    description: "Walk-in and phone admission inquiries.",
    sections: [
      { title: "New inquiries", description: "Capture leads and schedule tours." },
      { title: "Document collection", description: "Track submitted forms." },
    ],
  },
  "/receptionist/visitors": {
    title: "Visitors",
    description: "Log and badge visitors to the school.",
    sections: [
      { title: "Check-in", description: "Register arrivals and purpose." },
      { title: "Visitor log", description: "Today's and historical visits." },
    ],
  },

  "/student": {
    title: "Student Dashboard",
    description: "Your courses, assignments, grades, and schedule.",
    stats: [
      { label: "Courses", value: "—", hint: "Enrolled" },
      { label: "Assignments", value: "—", hint: "Due soon" },
      { label: "Attendance", value: "—", hint: "This term" },
    ],
  },
  "/student/courses": {
    title: "My Courses",
    description: "Subjects you are enrolled in this term.",
    sections: [
      { title: "Active courses", description: "Progress and materials per course." },
      { title: "Completed", description: "Past term courses." },
    ],
  },
  "/student/assignments": {
    title: "Assignments",
    description: "Homework and projects from your teachers.",
    sections: [
      { title: "Due soon", description: "Upcoming deadlines." },
      { title: "Submitted", description: "Work already handed in." },
    ],
  },
  "/student/grades": {
    title: "Grades",
    description: "Your scores, report cards, and academic transcript.",
    sections: [
      { title: "Overview", description: "Term GPA, recent assessments, and course summary." },
      { title: "Courses", description: "Running grades and assessment breakdown by course." },
      { title: "Report cards", description: "Published term reports with attendance." },
      { title: "Transcript", description: "Cumulative record across all terms." },
    ],
  },
  "/student/grades/courses": {
    title: "Course grades",
    description: "Grades and assessments for each enrolled course.",
  },
  "/student/grades/report-cards": {
    title: "Report cards",
    description: "Official term report cards and honor roll status.",
  },
  "/student/grades/transcript": {
    title: "Transcript",
    description: "Full academic transcript with cumulative GPA.",
  },
  "/student/attendance": {
    title: "Attendance",
    description: "Your attendance record for the term.",
    sections: [
      { title: "Summary", description: "Present, absent, and late counts." },
      { title: "Calendar", description: "Day-by-day breakdown." },
    ],
  },
  "/student/fees": {
    title: "Fees",
    description: "Your fee balance, payments, invoices, and account statement.",
    sections: [
      { title: "Overview", description: "Balance, breakdown, and upcoming due dates." },
      { title: "Payments", description: "Transaction history and receipts." },
      { title: "Invoices", description: "Term invoices and download." },
      { title: "Statement", description: "Full account statement for the term." },
    ],
  },
  "/student/timetable": {
    title: "Timetable",
    description: "Your weekly class schedule.",
    sections: [
      { title: "Week view", description: "Periods, rooms, and teachers." },
      { title: "Exams", description: "Scheduled assessments." },
    ],
  },
  "/student/library": {
    title: "Library",
    description: "Free and paid books, shop orders, and reading achievements.",
    sections: [
      { title: "Browse catalog", description: "Popular, ongoing, free, and paid titles." },
      { title: "My shelf", description: "Owned books, bookmarks, and reading progress." },
      { title: "Shop & orders", description: "Purchase physical kits, digital access, and receipts." },
    ],
  },
  "/student/library/books": {
    title: "Browse catalog",
    description: "Discover free and paid titles across the library.",
  },
  "/student/library/my-books": {
    title: "My shelf",
    description: "Accessible titles, bookmarks, and books in progress.",
  },
  "/student/library/shop": {
    title: "Library shop",
    description: "Physical kits, bundles, and digital editions.",
  },
  "/student/library/orders": {
    title: "Library orders",
    description: "Purchase history and order details.",
  },
  "/student/library/achievements": {
    title: "Reading achievements",
    description: "Goals, badges, and reading streaks.",
  },
  "/student/library/pay": {
    title: "Library checkout",
    description: "Review items and pay for shop purchases.",
  },

  "/parent": {
    title: "Parent Dashboard",
    description: "Follow your children's progress, fees, and attendance.",
    stats: [
      { label: "Children", value: "—", hint: "Linked accounts" },
      { label: "Fees due", value: "—", hint: "Outstanding" },
      { label: "Messages", value: "—", hint: "Unread" },
    ],
  },
  "/parent/children": {
    title: "My Children",
    description: "Profiles and quick links for each child.",
    sections: [
      { title: "Child list", description: "Switch between children." },
      { title: "Guardian info", description: "Update contact details." },
    ],
  },
  "/parent/fees": {
    title: "Fees & Payments",
    description: "Pay school fees and download receipts.",
    sections: [
      { title: "Outstanding", description: "Balances per child." },
      { title: "Pay online", description: "Secure payment options." },
    ],
  },
  "/parent/attendance": {
    title: "Attendance",
    description: "Attendance records for your children.",
    sections: [
      { title: "This term", description: "Present and absent days." },
      { title: "Alerts", description: "Absence notifications." },
    ],
  },
  "/parent/grades": {
    title: "Grades",
    description: "Academic performance for your children.",
    sections: [
      { title: "Report cards", description: "Term grades by subject." },
      { title: "Teacher notes", description: "Comments from educators." },
    ],
  },
  "/parent/messages": {
    title: "Messages",
    description: "Communicate with teachers and school staff.",
    sections: [
      { title: "Inbox", description: "Conversations with the school." },
      { title: "Compose", description: "Message a teacher or admin." },
    ],
  },

  "/shared/announcements": {
    title: "Announcements",
    description: "School-wide news and updates.",
    sections: [
      { title: "Latest", description: "Recent announcements." },
      { title: "Pinned", description: "Important notices." },
    ],
  },
  "/shared/calendar": {
    title: "Calendar",
    description: "Events, exams, and school holidays.",
    sections: [
      { title: "Month view", description: "All scheduled activities." },
      { title: "My events", description: "Items relevant to you." },
    ],
  },
  "/shared/events": {
    title: "Events",
    description: "Sports, cultural, and academic events.",
    sections: [
      { title: "Upcoming", description: "Register and RSVP." },
      { title: "Past events", description: "Archive and photos." },
    ],
  },
  "/shared/messages": {
    title: "Messages",
    description: "Secure messaging within the school community.",
    sections: [
      { title: "Inbox", description: "Your conversations." },
      { title: "New message", description: "Start a thread." },
    ],
  },
  "/shared/notifications": {
    title: "Notifications",
    description: "Alerts about grades, fees, attendance, and more.",
    sections: [
      { title: "Unread", description: "Items needing attention." },
      { title: "History", description: "All past notifications." },
    ],
  },
  "/shared/support": {
    title: "Support",
    description: "Open tickets and get help from the school team.",
    sections: [
      { title: "Open ticket", description: "Describe your issue." },
      { title: "My tickets", description: "Track resolution status." },
    ],
  },
  "/shared/profile": {
    title: "Profile",
    description: "Your account details and avatar.",
    sections: [
      { title: "Personal info", description: "Name, email, and phone." },
      { title: "Security", description: "Password and sessions." },
    ],
  },
  "/shared/settings": {
    title: "Settings",
    description: "Notification and display preferences.",
    sections: [
      { title: "Notifications", description: "Email and in-app alerts." },
      { title: "Language", description: "Interface language." },
    ],
  },
  "/shared/online-classes": {
    title: "Online Classes",
    description: "Join live virtual sessions with your teachers.",
    sections: [
      { title: "Live now", description: "Sessions in progress." },
      { title: "Scheduled", description: "Upcoming online classes." },
    ],
  },
  "/shared/leave": {
    title: "Leave",
    description: "Submit and track leave requests.",
    sections: [
      { title: "Request leave", description: "Apply for time off." },
      { title: "My requests", description: "Status and history." },
    ],
  },
};

export function getDashboardPageMeta(path: string): DashboardPageMeta {
  if (path.endsWith("/notifications")) {
    return (
      DASHBOARD_PAGE_META[path] ?? {
        title: "Notifications",
        description: "Alerts about grades, fees, attendance, and more.",
        sections: [
          { title: "Unread", description: "Items needing attention." },
          { title: "History", description: "All past notifications." },
        ],
      }
    );
  }

  return (
    DASHBOARD_PAGE_META[path] ?? {
      title: "Dashboard",
      description: "Manage and view this section.",
      sections: [{ title: "Content", description: "This module is ready for data integration." }],
    }
  );
}
