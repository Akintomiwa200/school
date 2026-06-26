import { Briefcase, CalendarOff, UserPlus, Users } from "lucide-react";

export const HR_DASHBOARD_STATS = [
  { id: "employees", label: "Employees", value: "86", hint: "Active staff", tone: "purple" as const, icon: Users },
  { id: "leave", label: "On leave", value: "4", hint: "Today", tone: "orange" as const, icon: CalendarOff },
  { id: "open", label: "Open roles", value: "3", hint: "Recruitment", tone: "blue" as const, icon: Briefcase },
  { id: "pending", label: "Pending leave", value: "7", hint: "Awaiting approval", tone: "green" as const, icon: UserPlus },
];

export const HR_EMPLOYEES = [
  { id: "e1", name: "Mr. Adeyemi", employeeId: "EMP-1042", department: "Mathematics", contract: "Full-time", startDate: "2020-09-01", status: "active" as const },
  { id: "e2", name: "Ms. Okafor", employeeId: "EMP-1088", department: "Science", contract: "Full-time", startDate: "2021-01-15", status: "active" as const },
  { id: "e3", name: "Fatima Yusuf", employeeId: "EMP-1156", department: "Library", contract: "Part-time", startDate: "2022-03-01", status: "on_leave" as const },
  { id: "e4", name: "James Okonkwo", employeeId: "EMP-1201", department: "Finance", contract: "Full-time", startDate: "2019-08-20", status: "active" as const },
];

export const HR_LEAVE_REQUESTS = [
  { id: "lv1", employee: "Fatima Yusuf", type: "Sick leave", from: "2026-03-03", to: "2026-03-07", days: 5, status: "approved" as const },
  { id: "lv2", employee: "David Kim", type: "Annual leave", from: "2026-03-15", to: "2026-03-22", days: 8, status: "pending" as const },
  { id: "lv3", employee: "Ms. Okafor", type: "Personal leave", from: "2026-03-10", to: "2026-03-11", days: 2, status: "pending" as const },
];

export const HR_RECRUITMENT = [
  { id: "job1", title: "Mathematics Teacher", department: "Academic", applicants: 12, posted: "2026-02-15", status: "open" as const },
  { id: "job2", title: "IT Support Specialist", department: "Technology", applicants: 8, posted: "2026-02-20", status: "open" as const },
  { id: "job3", title: "School Counselor", department: "Student Services", applicants: 5, posted: "2026-01-10", status: "interviewing" as const },
];
