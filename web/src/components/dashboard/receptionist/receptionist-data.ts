import { Headphones, UserCheck, UserPlus } from "lucide-react";

export const RECEPTIONIST_DASHBOARD_STATS = [
  { id: "visitors", label: "Visitors today", value: "12", hint: "Checked in", tone: "purple" as const, icon: UserCheck },
  { id: "applications", label: "Applications", value: "5", hint: "Pending review", tone: "orange" as const, icon: UserPlus },
  { id: "tickets", label: "Support tickets", value: "3", hint: "Open", tone: "blue" as const, icon: Headphones },
];

export const RECEPTIONIST_INQUIRIES = [
  { id: "inq1", name: "Mrs. Okonkwo", phone: "+234 801 234 5678", grade: "Grade 7", source: "Walk-in", date: "2026-03-06", status: "new" as const },
  { id: "inq2", name: "Mr. Tanaka", phone: "+234 802 345 6789", grade: "Grade 10", source: "Phone", date: "2026-03-05", status: "tour_scheduled" as const },
  { id: "inq3", name: "Dr. Mensah", phone: "+233 24 567 8901", grade: "Grade 12", source: "Email", date: "2026-03-04", status: "documents_pending" as const },
];

export const RECEPTIONIST_VISITORS = [
  { id: "v1", name: "James Parent", purpose: "Parent-teacher meeting", host: "Mr. Adeyemi", checkIn: "09:15", checkOut: null, badge: "V-042" },
  { id: "v2", name: "Vendor — Office Depot", purpose: "Delivery", host: "Admin office", checkIn: "10:30", checkOut: "10:55", badge: "V-043" },
  { id: "v3", name: "Sarah Consultant", purpose: "IT audit", host: "David Kim", checkIn: "11:00", checkOut: null, badge: "V-044" },
];
