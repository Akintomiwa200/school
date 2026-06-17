import type { CourseMode, CourseStatus } from "./index";

export interface Course {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  mode: CourseMode;
  status: CourseStatus;
  startDate?: Date;
  endDate?: Date;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate: Date;
  maxScore: number;
  status: string;
  createdAt: Date;
}

export interface OnlineClass {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  meetingUrl?: string;
  hostId: string;
  recordingUrl?: string;
  status: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}
