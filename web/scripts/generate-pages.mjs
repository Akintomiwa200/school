import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const page = (title) => `export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">${title}</h1>
        <p className="text-muted-foreground">Manage and view ${title} content.</p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">This page is ready for implementation.</p>
      </div>
    </div>
  );
}
`;

const api = (name) => `import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";

export async function GET(request: NextRequest) {
  return NextResponse.json(createApiResponse([], "${name} endpoint - GET"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(createApiResponse(body, "${name} endpoint - POST"), { status: 201 });
}
`;

const dashboards = [
  ["(dashboard)/super-admin", "Super Admin Dashboard"],
  ["(dashboard)/admin", "Admin Dashboard"],
  ["(dashboard)/admin/students", "Students Management"],
  ["(dashboard)/admin/staff", "Staff Management"],
  ["(dashboard)/admin/classes", "Classes Management"],
  ["(dashboard)/admin/subjects", "Subjects Management"],
  ["(dashboard)/admin/academic-years", "Academic Years"],
  ["(dashboard)/admin/settings", "Admin Settings"],
  ["(dashboard)/admin/reports", "Admin Reports"],
  ["(dashboard)/accountant", "Accountant Dashboard"],
  ["(dashboard)/accountant/fees", "Fee Structure"],
  ["(dashboard)/accountant/payments", "Payments"],
  ["(dashboard)/accountant/expenses", "Expenses"],
  ["(dashboard)/accountant/invoices", "Invoices"],
  ["(dashboard)/accountant/payroll", "Payroll"],
  ["(dashboard)/accountant/reports", "Financial Reports"],
  ["(dashboard)/accountant/audit", "Audit Logs"],
  ["(dashboard)/teacher", "Teacher Dashboard"],
  ["(dashboard)/teacher/courses", "My Courses"],
  ["(dashboard)/teacher/attendance", "Mark Attendance"],
  ["(dashboard)/teacher/assignments", "Assignments"],
  ["(dashboard)/teacher/grades", "Grades"],
  ["(dashboard)/teacher/timetable", "Timetable"],
  ["(dashboard)/teacher/materials", "Course Materials"],
  ["(dashboard)/teacher/classes", "My Classes"],
  ["(dashboard)/staff", "Staff Dashboard"],
  ["(dashboard)/staff/attendance", "Attendance"],
  ["(dashboard)/staff/transport", "Transport"],
  ["(dashboard)/staff/hostel", "Hostel"],
  ["(dashboard)/staff/inventory", "Inventory"],
  ["(dashboard)/student", "Student Dashboard"],
  ["(dashboard)/student/courses", "My Courses"],
  ["(dashboard)/student/assignments", "Assignments"],
  ["(dashboard)/student/grades", "My Grades"],
  ["(dashboard)/student/attendance", "My Attendance"],
  ["(dashboard)/student/fees", "My Fees"],
  ["(dashboard)/student/timetable", "Timetable"],
  ["(dashboard)/student/library", "Library"],
  ["(dashboard)/parent", "Parent Dashboard"],
  ["(dashboard)/parent/children", "My Children"],
  ["(dashboard)/parent/fees", "Fees & Payments"],
  ["(dashboard)/parent/attendance", "Children Attendance"],
  ["(dashboard)/parent/grades", "Children Grades"],
  ["(dashboard)/parent/messages", "Messages"],
  ["(dashboard)/librarian", "Librarian Dashboard"],
  ["(dashboard)/librarian/books", "Books Catalog"],
  ["(dashboard)/librarian/issues", "Issues & Returns"],
  ["(dashboard)/hr", "HR Dashboard"],
  ["(dashboard)/hr/employees", "Employees"],
  ["(dashboard)/hr/leave", "Leave Management"],
  ["(dashboard)/hr/recruitment", "Recruitment"],
  ["(dashboard)/receptionist", "Receptionist Dashboard"],
  ["(dashboard)/shared/announcements", "Announcements"],
  ["(dashboard)/shared/calendar", "Calendar"],
  ["(dashboard)/shared/events", "Events"],
  ["(dashboard)/shared/messages", "Messages"],
  ["(dashboard)/shared/notifications", "Notifications"],
  ["(dashboard)/shared/profile", "Profile"],
  ["(dashboard)/shared/settings", "Settings"],
  ["(dashboard)/shared/support", "Support"],
  ["(dashboard)/shared/online-classes", "Online Classes"],
];

const apis = [
  "auth", "users", "students", "staff", "classes", "subjects", "courses",
  "attendance", "assignments", "grades", "fees", "payments", "expenses",
  "invoices", "payroll", "audit", "materials", "announcements", "messages",
  "notifications", "support", "events", "calendar", "library", "transport",
  "hostel", "admissions", "reports", "settings", "online-classes", "timetable",
  "leave", "inventory",
];

let count = 0;

for (const [route, title] of dashboards) {
  const filePath = path.join(root, "app", route, "page.tsx");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, page(title));
  count++;
}

for (const name of apis) {
  const filePath = path.join(root, "app/api/v1", name, "route.ts");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, api(name));
  count++;
}

console.log(`Generated ${count} files`);
