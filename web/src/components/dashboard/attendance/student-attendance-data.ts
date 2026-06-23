import { addDays, startOfDay } from "@/lib/schedule-time";
import { getTodayLiveRecords } from "./attendance-live-store";

export type AttendancePeriod = "Monthly" | "Weekly" | "Yearly";

export type StudentAttendanceStatus = "present" | "late" | "undertime" | "absent" | "excused";

export type ClassDeliveryMode = "physical" | "virtual" | "hybrid";

export type AttendanceMarkMethod =
  | "physical-geolocation"
  | "virtual-code"
  | "virtual-link"
  | "hybrid-geolocation"
  | "hybrid-virtual";

export type AttendanceSession = {
  id: string;
  courseId: string;
  className: string;
  teacher: string;
  mode: ClassDeliveryMode;
  startsAt: Date;
  endsAt: Date;
  room?: string;
  building?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  meetingUrl?: string;
  virtualCode?: string;
};

export type AttendanceStudent = {
  id: string;
  name: string;
  studentId: string;
  phone: string;
  email: string;
  address: string;
};

export type AttendanceStats = {
  totalAttendance: number;
  late: number;
  undertime: number;
  absent: number;
  classDays: number;
  attendanceRate: number;
};

export type MonthlyRate = {
  month: string;
  rate: number;
  color: "blue" | "orange" | "green" | "pink" | "purple";
};

export type TopAttendanceStudent = {
  id: string;
  number: number;
  name: string;
  studentId: string;
  progress: number;
};

export type StudentAttendanceRecord = {
  id: string;
  date: string;
  status: StudentAttendanceStatus;
  className: string;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
};

const MONTHLY_COLOR: Record<MonthlyRate["color"], string> = {
  blue: "bg-brand-blue",
  orange: "bg-brand-orange",
  green: "bg-green",
  pink: "bg-brand-pink",
  purple: "bg-brand-purple",
};

export function getMonthlyRateColor(color: MonthlyRate["color"]) {
  return MONTHLY_COLOR[color];
}

export const ATTENDANCE_PERIODS: AttendancePeriod[] = ["Monthly", "Weekly", "Yearly"];

export const DEFAULT_STUDENT: AttendanceStudent = {
  id: "1",
  name: "Caleb White",
  studentId: "2021-0001",
  phone: "(555) 123-4567",
  email: "caleb.white@gmail.com",
  address: "123 Elm Street",
};

export const ATTENDANCE_BY_PERIOD: Record<AttendancePeriod, AttendanceStats> = {
  Monthly: {
    totalAttendance: 13,
    late: 7,
    undertime: 1,
    absent: 2,
    classDays: 23,
    attendanceRate: 56,
  },
  Weekly: {
    totalAttendance: 4,
    late: 2,
    undertime: 0,
    absent: 1,
    classDays: 5,
    attendanceRate: 80,
  },
  Yearly: {
    totalAttendance: 142,
    late: 28,
    undertime: 6,
    absent: 14,
    classDays: 190,
    attendanceRate: 75,
  },
};

export const MONTHLY_RATES: MonthlyRate[] = [
  { month: "January", rate: 57, color: "blue" },
  { month: "February", rate: 55, color: "orange" },
  { month: "March", rate: 62, color: "green" },
  { month: "April", rate: 58, color: "pink" },
  { month: "May", rate: 54, color: "purple" },
  { month: "June", rate: 56, color: "blue" },
];

export const TOP_ATTENDANCE_STUDENTS: TopAttendanceStudent[] = [
  { id: "1", number: 1, name: "Caleb White", studentId: "2021-0001", progress: 56 },
  { id: "2", number: 2, name: "Grace Johnson", studentId: "2021-0002", progress: 72 },
  { id: "3", number: 3, name: "Marcus Lee", studentId: "2021-0003", progress: 68 },
  { id: "4", number: 4, name: "Aisha Patel", studentId: "2021-0004", progress: 81 },
  { id: "5", number: 5, name: "Noah Brooks", studentId: "2021-0005", progress: 64 },
];

const CLASS_NAMES = [
  "English Literature",
  "Mathematics",
  "Computer Science",
  "Business Studies",
  "Design Strategy",
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMockRecords(referenceDate = new Date()): StudentAttendanceRecord[] {
  const today = startOfDay(referenceDate);
  const pattern: StudentAttendanceStatus[] = [
    "present",
    "late",
    "present",
    "present",
    "late",
    "undertime",
    "absent",
    "present",
    "late",
    "present",
    "present",
    "late",
    "present",
    "absent",
    "present",
    "late",
    "present",
    "present",
    "late",
    "present",
    "present",
    "late",
    "present",
  ];

  const records: StudentAttendanceRecord[] = [];

  for (let index = 0; index < pattern.length; index++) {
    const status = pattern[index];
    const date = addDays(today, -(pattern.length - 1 - index));
    const isSchoolDay = date.getDay() !== 0 && date.getDay() !== 6;
    if (!isSchoolDay) {
      continue;
    }

    const id = `att-${formatDateKey(date)}`;
    const className = CLASS_NAMES[index % CLASS_NAMES.length];

    if (status === "absent") {
      records.push({
        id,
        date: formatDateKey(date),
        status,
        className,
        remarks: "No check-in recorded for this session.",
      });
      continue;
    }

    const checkInHour = status === "late" ? 8 : status === "undertime" ? 7 : 7;
    const checkInMinute = status === "late" ? 45 : 55;
    const checkOutHour = status === "undertime" ? 14 : 15;
    const checkOutMinute = status === "undertime" ? 20 : 30;

    records.push({
      id,
      date: formatDateKey(date),
      status,
      className,
      checkIn: `${String(checkInHour).padStart(2, "0")}:${String(checkInMinute).padStart(2, "0")} AM`,
      checkOut: `${checkOutHour - 12 > 0 ? checkOutHour - 12 : checkOutHour}:${String(checkOutMinute).padStart(2, "0")} PM`,
      remarks:
        status === "late"
          ? "Arrived after the morning bell."
          : status === "undertime"
            ? "Left before the end of the final period."
            : undefined,
    });
  }

  return records;
}

const ALL_RECORDS = buildMockRecords();

export function getAttendanceStats(period: AttendancePeriod) {
  const base = { ...ATTENDANCE_BY_PERIOD[period] };
  const liveToday = getTodayLiveRecords();

  if (liveToday.length === 0) {
    return base;
  }

  for (const record of liveToday) {
    base.totalAttendance += 1;
    if (record.status === "late") base.late += 1;
    if (record.status === "undertime") base.undertime += 1;
    if (record.status === "absent") base.absent += 1;
  }

  const totalDays = base.classDays + (liveToday.length > 0 ? 1 : 0);
  const presentCount = base.totalAttendance - base.late - base.undertime - base.absent;
  base.attendanceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : base.attendanceRate;

  return base;
}

export function getAttendanceRecords(options?: {
  period?: AttendancePeriod;
  status?: StudentAttendanceStatus | "all";
}) {
  const liveToday = getTodayLiveRecords();
  const liveIds = new Set(liveToday.map((record) => record.id));
  let records = [...ALL_RECORDS.filter((record) => !liveIds.has(record.id)), ...liveToday];

  if (options?.status && options.status !== "all") {
    records = records.filter((record) => record.status === options.status);
  }

  if (options?.period === "Weekly") {
    records = records.slice(-5);
  } else if (options?.period === "Monthly") {
    records = records.slice(-23);
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export function getAttendanceRecordById(recordId: string) {
  const live = getTodayLiveRecords().find((record) => record.id === recordId);
  if (live) return live;
  return ALL_RECORDS.find((record) => record.id === recordId);
}

export function getAttendanceRecordByDate(dateKey: string) {
  const live = getTodayLiveRecords().find((record) => record.date === dateKey);
  if (live) return live;
  return ALL_RECORDS.find((record) => record.date === dateKey);
}

export function getCalendarMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: Array<{
    date: number;
    dateKey: string;
    inMonth: boolean;
    record?: StudentAttendanceRecord;
  }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    const date = addDays(firstDay, -(startOffset - i));
    days.push({
      date: date.getDate(),
      dateKey: formatDateKey(date),
      inMonth: false,
      record: getAttendanceRecordByDate(formatDateKey(date)),
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    days.push({
      date: day,
      dateKey,
      inMonth: true,
      record: getAttendanceRecordByDate(dateKey),
    });
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    const next = addDays(new Date(last.dateKey), 1);
    days.push({
      date: next.getDate(),
      dateKey: formatDateKey(next),
      inMonth: false,
      record: getAttendanceRecordByDate(formatDateKey(next)),
    });
  }

  return days;
}

export function formatDisplayDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function attendanceHistoryHref(recordId: string) {
  return `/student/attendance/history/${recordId}`;
}

export function attendanceMarkHref(sessionId?: string) {
  const base = "/student/attendance/mark";
  return sessionId ? `${base}/${sessionId}` : base;
}
