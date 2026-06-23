"use client";

import { useSyncExternalStore } from "react";
import { buildDateTime, startOfDay } from "@/lib/schedule-time";
import type {
  AttendanceMarkMethod,
  AttendanceSession,
  StudentAttendanceRecord,
  StudentAttendanceStatus,
} from "./student-attendance-data";

export type LiveAttendanceMark = {
  sessionId: string;
  recordId: string;
  className: string;
  status: StudentAttendanceStatus;
  markedAt: Date;
  method: AttendanceMarkMethod;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
};

let liveMarks: LiveAttendanceMark[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return liveMarks;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useLiveAttendanceMarks() {
  return useSyncExternalStore(subscribe, getSnapshot, () => []);
}

export function getLiveAttendanceMarks() {
  return liveMarks;
}

export function getLiveMarkForSession(sessionId: string) {
  return liveMarks.find((mark) => mark.sessionId === sessionId);
}

export function hasMarkedSession(sessionId: string) {
  return liveMarks.some((mark) => mark.sessionId === sessionId);
}

export function addLiveAttendanceMark(input: {
  session: AttendanceSession;
  status: StudentAttendanceStatus;
  method: AttendanceMarkMethod;
  markedAt?: Date;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
}) {
  const markedAt = input.markedAt ?? new Date();
  const recordId = `live-${input.session.id}-${formatDateKey(markedAt)}`;

  const mark: LiveAttendanceMark = {
    sessionId: input.session.id,
    recordId,
    className: input.session.className,
    status: input.status,
    markedAt,
    method: input.method,
    latitude: input.latitude,
    longitude: input.longitude,
    distanceMeters: input.distanceMeters,
  };

  liveMarks = [mark, ...liveMarks.filter((item) => item.sessionId !== input.session.id)];
  emit();
  return mark;
}

export function liveMarkToRecord(mark: LiveAttendanceMark): StudentAttendanceRecord {
  return {
    id: mark.recordId,
    date: formatDateKey(mark.markedAt),
    status: mark.status,
    className: mark.className,
    checkIn: formatClock(mark.markedAt),
    remarks:
      mark.method === "physical-geolocation"
        ? `Marked on campus (${Math.round(mark.distanceMeters ?? 0)} m from classroom).`
        : mark.method === "virtual-code"
          ? "Marked via virtual class code."
          : mark.method === "virtual-link"
            ? "Marked after joining the online session."
            : "Marked via hybrid attendance.",
  };
}

export function getTodayLiveRecords() {
  const todayKey = formatDateKey(new Date());
  return liveMarks
    .filter((mark) => formatDateKey(mark.markedAt) === todayKey)
    .map(liveMarkToRecord);
}

/** Demo campus location used by mock physical sessions. */
export const DEMO_CAMPUS_LOCATION = {
  latitude: 40.758,
  longitude: -73.9855,
  label: "Main Campus — Room Block A",
};

export function buildDemoSessions(referenceDate = new Date()): AttendanceSession[] {
  const today = startOfDay(referenceDate);

  return [
    {
      id: "sess-english",
      courseId: "1",
      className: "English Literature",
      teacher: "Ms. Sarah Chen",
      mode: "physical",
      startsAt: buildDateTime(today, 8, 0),
      endsAt: buildDateTime(today, 9, 30),
      room: "Room 201",
      building: "Block A",
      latitude: DEMO_CAMPUS_LOCATION.latitude,
      longitude: DEMO_CAMPUS_LOCATION.longitude,
      geofenceRadiusMeters: 200,
    },
    {
      id: "sess-cs",
      courseId: "4",
      className: "Computer Science",
      teacher: "Prof. David Kim",
      mode: "virtual",
      startsAt: buildDateTime(today, 10, 0),
      endsAt: buildDateTime(today, 11, 30),
      meetingUrl: "https://meet.example.com/cs-algorithms",
      virtualCode: "CS2026",
    },
    {
      id: "sess-business",
      courseId: "3",
      className: "Business Studies",
      teacher: "Dr. Amira Hassan",
      mode: "hybrid",
      startsAt: buildDateTime(today, 13, 0),
      endsAt: buildDateTime(today, 14, 30),
      room: "Room 105",
      building: "Block B",
      latitude: DEMO_CAMPUS_LOCATION.latitude + 0.0008,
      longitude: DEMO_CAMPUS_LOCATION.longitude + 0.0005,
      geofenceRadiusMeters: 200,
      meetingUrl: "https://meet.example.com/business-studies",
      virtualCode: "BUS330",
    },
    {
      id: "sess-design",
      courseId: "2",
      className: "Design Strategy",
      teacher: "James Okonkwo",
      mode: "virtual",
      startsAt: buildDateTime(today, 15, 0),
      endsAt: buildDateTime(today, 16, 30),
      meetingUrl: "https://meet.example.com/design-lab",
      virtualCode: "DS118",
    },
  ];
}

export type SessionWindowState = "upcoming" | "open" | "ended" | "marked";

export function getSessionWindowState(
  session: AttendanceSession,
  now: Date,
  marked: boolean,
): SessionWindowState {
  if (marked) return "marked";
  if (now < session.startsAt) return "upcoming";
  if (now > session.endsAt) return "ended";
  return "open";
}

export function resolveAttendanceStatus(session: AttendanceSession, now: Date): StudentAttendanceStatus {
  const lateAfterMs = 15 * 60 * 1000;
  return now.getTime() > session.startsAt.getTime() + lateAfterMs ? "late" : "present";
}

export function formatSessionTimeRange(session: AttendanceSession) {
  const fmt = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(session.startsAt)} - ${fmt(session.endsAt)}`;
}
