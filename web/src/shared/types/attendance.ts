import type { AttendanceStatus } from "./index";

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  staffId?: string;
  classId?: string;
  date: Date;
  status: AttendanceStatus;
  checkIn?: Date;
  checkOut?: Date;
  remarks?: string;
  markedBy: string;
  createdAt: Date;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}
