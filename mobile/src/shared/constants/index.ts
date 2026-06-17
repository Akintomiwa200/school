export const APP_NAME = "School LMS";
export const APP_DESCRIPTION = "Complete School Learning Management System";
export const APP_VERSION = "1.0.0";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "audio/mpeg",
];

export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";
export const DATE_FORMAT = "MMM dd, yyyy";
export const DATETIME_FORMAT = "MMM dd, yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";

export const ACADEMIC_TERMS = ["Term 1", "Term 2", "Term 3"] as const;
export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const FEE_TYPES = [
  "Tuition",
  "Registration",
  "Examination",
  "Library",
  "Transport",
  "Hostel",
  "Sports",
  "Laboratory",
  "Other",
] as const;

export const DEPARTMENTS = [
  "Administration",
  "Academic",
  "Finance",
  "HR",
  "IT",
  "Library",
  "Transport",
  "Hostel",
  "Sports",
  "Maintenance",
] as const;

export * from "./api-endpoints";
export * from "./email-templates";
