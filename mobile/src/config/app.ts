/** App-level configuration — splash timing, onboarding, network errors */

export const appConfig = {
  name: "School LMS",
  splashDurationMs: 3000,
} as const;

export const networkErrors = {
  title: "No internet connection",
  message:
    "Check your Wi‑Fi or mobile data and try again. School LMS needs a connection to sign in and sync your data.",
  retryLabel: "Try again",
  alertTitle: "You're offline",
  alertMessage: "No internet connection. Check your network and try again.",
} as const;

export const ONBOARDING_STORAGE_KEY = "school-lms-app-onboarding-complete";

export const onboardingSteps = [
  {
    title: "Welcome to School LMS",
    body: "Your school dashboard in your pocket — courses, grades, and updates wherever you are.",
    icon: "school" as const,
  },
  {
    title: "Stay on top of school",
    body: "Track attendance, assignments, fees, and your timetable without opening a browser.",
    icon: "calendar" as const,
  },
  {
    title: "Never miss an update",
    body: "Get messages, announcements, and alerts from teachers and staff in one place.",
    icon: "notifications" as const,
  },
] as const;
