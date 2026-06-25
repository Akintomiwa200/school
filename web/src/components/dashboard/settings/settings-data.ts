import {
  Accessibility,
  Bell,
  CreditCard,
  Eye,
  Info,
  Link2,
  Palette,
  Shield,
  SlidersHorizontal,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { UserRole } from "@/shared";

export type SettingsTabId =
  | "general"
  | "appearance"
  | "preferences"
  | "privacy"
  | "accessibility"
  | "security"
  | "notifications"
  | "integrations"
  | "account"
  | "account-manager"
  | "billing";

export type SettingsTab = {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "general",
    label: "General Information",
    icon: Info,
    description: "Profile photo, contact details, and address.",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    description: "Theme, colors, layout density, and display style.",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
    description: "Language, timezone, and regional formats.",
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: Eye,
    description: "Profile visibility and data sharing controls.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    icon: Accessibility,
    description: "Motion, contrast, and readability options.",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Password, two-factor auth, and sessions.",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and in-app alert preferences.",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Link2,
    description: "Connected apps and external services.",
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    description: "Account type, membership, and data.",
  },
  {
    id: "account-manager",
    label: "Account Manager",
    icon: Users,
    description: "Linked accounts and delegated access.",
  },
  {
    id: "billing",
    label: "Billings",
    icon: CreditCard,
    description: "Payment methods and billing history.",
  },
];

export type GeneralSettingsForm = {
  businessName: string;
  email: string;
  phone: string;
  fax: string;
  country: string;
  city: string;
  postcode: string;
  state: string;
};

export type AppearanceForm = {
  theme: "system" | "light" | "dark";
  accent: "purple" | "blue" | "green" | "orange";
  fontSize: "sm" | "md" | "lg";
  density: "compact" | "comfortable" | "spacious";
  sidebarStyle: "expanded" | "collapsed" | "auto";
};

export type PreferencesForm = {
  language: string;
  timezone: string;
  dateFormat: string;
  weekStart: string;
  timeFormat: "12h" | "24h";
  numberFormat: string;
};

export type PrivacyForm = {
  profileVisible: boolean;
  showOnlineStatus: boolean;
  shareActivity: boolean;
  showEmail: boolean;
  allowMessagesFrom: "everyone" | "teachers" | "none";
  showGradesToParents: boolean;
};

export type AccessibilityForm = {
  reducedMotion: boolean;
  highContrast: boolean;
  largerClickTargets: boolean;
  screenReaderOptimized: boolean;
  underlineLinks: boolean;
  focusIndicators: boolean;
};

export type NotificationPrefs = {
  emailAnnouncements: boolean;
  emailAssignments: boolean;
  emailGrades: boolean;
  emailMessages: boolean;
  pushAnnouncements: boolean;
  pushAssignments: boolean;
  pushGrades: boolean;
  pushMessages: boolean;
  digestWeekly: boolean;
};

export type IntegrationService = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: string;
};

export const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "United Kingdom", "United States"] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
] as const;

export const TIMEZONES = [
  { value: "Africa/Lagos", label: "West Africa (WAT)" },
  { value: "Africa/Nairobi", label: "East Africa (EAT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "America/New_York", label: "Eastern US (EST)" },
] as const;

export const THEME_OPTIONS = [
  { value: "system", label: "System", hint: "Match device" },
  { value: "light", label: "Light", hint: "Bright & clean" },
  { value: "dark", label: "Dark", hint: "Easy on eyes" },
] as const;

export const ACCENT_OPTIONS = [
  { value: "purple", label: "Purple", color: "#5d21d0" },
  { value: "blue", label: "Blue", color: "#2563eb" },
  { value: "green", label: "Green", color: "#16a34a" },
  { value: "orange", label: "Orange", color: "#ea580c" },
] as const;

export const FONT_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
] as const;

export const DENSITY_OPTIONS = [
  { value: "compact", label: "Compact", hint: "More content on screen" },
  { value: "comfortable", label: "Comfortable", hint: "Balanced spacing" },
  { value: "spacious", label: "Spacious", hint: "Extra breathing room" },
] as const;

export const SIDEBAR_STYLES = [
  { value: "expanded", label: "Always expanded" },
  { value: "collapsed", label: "Always collapsed" },
  { value: "auto", label: "Auto (remember last)" },
] as const;

export const DATE_FORMATS = [
  { value: "mdy", label: "MM/DD/YYYY" },
  { value: "dmy", label: "DD/MM/YYYY" },
  { value: "ymd", label: "YYYY-MM-DD" },
] as const;

export const WEEK_STARTS = [
  { value: "monday", label: "Monday" },
  { value: "sunday", label: "Sunday" },
] as const;

export const TIME_FORMATS = [
  { value: "12h", label: "12-hour (2:30 PM)" },
  { value: "24h", label: "24-hour (14:30)" },
] as const;

export const NUMBER_FORMATS = [
  { value: "1,234.56", label: "1,234.56 (US)" },
  { value: "1.234,56", label: "1.234,56 (EU)" },
  { value: "1 234,56", label: "1 234,56 (FR)" },
] as const;

export const MESSAGE_PRIVACY_OPTIONS = [
  { value: "everyone", label: "Everyone at school" },
  { value: "teachers", label: "Teachers & staff only" },
  { value: "none", label: "Nobody (block messages)" },
] as const;

export const DEMO_LINKED_ACCOUNTS = [
  { id: "child-1", name: "Emma Johnson", role: "Student · Grade 9", status: "Active" },
  { id: "child-2", name: "Noah Johnson", role: "Student · Grade 6", status: "Active" },
];

export const DEMO_PAYMENT_METHODS = [
  { id: "pm-1", label: "Visa ending in 4242", expiry: "08/2027", default: true },
  { id: "pm-2", label: "Mastercard ending in 8210", expiry: "03/2026", default: false },
];

export const DEMO_INTEGRATIONS: IntegrationService[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync timetable and school events to your calendar.",
    connected: true,
    icon: "📅",
  },
  {
    id: "google-classroom",
    name: "Google Classroom",
    description: "Import assignments and class materials.",
    connected: false,
    icon: "🎓",
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Join online classes and team meetings.",
    connected: false,
    icon: "💬",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Launch live sessions from your timetable.",
    connected: true,
    icon: "📹",
  },
];

export function getSettingsTabsForRole(role: UserRole): SettingsTab[] {
  return SETTINGS_TABS.filter((tab) => {
    if (tab.id === "account-manager" && role !== UserRole.PARENT && role !== UserRole.ADMIN) {
      return false;
    }
    if (
      tab.id === "billing" &&
      role !== UserRole.STUDENT &&
      role !== UserRole.PARENT &&
      role !== UserRole.ACCOUNTANT
    ) {
      return false;
    }
    if (
      tab.id === "integrations" &&
      role !== UserRole.STUDENT &&
      role !== UserRole.TEACHER &&
      role !== UserRole.PARENT
    ) {
      return false;
    }
    return true;
  });
}

export function getDefaultGeneralForm(role: UserRole): GeneralSettingsForm {
  return {
    businessName: "Greenfield International School",
    email: "alex.johnson@school.edu",
    phone: "+234 801 234 5678",
    fax: "",
    country: "Nigeria",
    city: "Lagos",
    postcode: "101233",
    state: "Lagos",
  };
}

export function getDefaultAppearance(): AppearanceForm {
  return {
    theme: "system",
    accent: "purple",
    fontSize: "md",
    density: "comfortable",
    sidebarStyle: "auto",
  };
}

export function getDefaultPreferences(): PreferencesForm {
  return {
    language: "en",
    timezone: "Africa/Lagos",
    dateFormat: "dmy",
    weekStart: "monday",
    timeFormat: "12h",
    numberFormat: "1,234.56",
  };
}

export function getDefaultPrivacy(role: UserRole): PrivacyForm {
  const isStudent = role === UserRole.STUDENT;
  return {
    profileVisible: true,
    showOnlineStatus: true,
    shareActivity: isStudent,
    showEmail: false,
    allowMessagesFrom: isStudent ? "teachers" : "everyone",
    showGradesToParents: true,
  };
}

export function getDefaultAccessibility(): AccessibilityForm {
  return {
    reducedMotion: false,
    highContrast: false,
    largerClickTargets: false,
    screenReaderOptimized: false,
    underlineLinks: false,
    focusIndicators: true,
  };
}

export function getDefaultNotificationPrefs(): NotificationPrefs {
  return {
    emailAnnouncements: true,
    emailAssignments: true,
    emailGrades: true,
    emailMessages: false,
    pushAnnouncements: true,
    pushAssignments: true,
    pushGrades: true,
    pushMessages: true,
    digestWeekly: false,
  };
}

export function getDefaultIntegrations(): IntegrationService[] {
  return DEMO_INTEGRATIONS.map((item) => ({ ...item }));
}

export const SETTINGS_PATH = "/shared/settings";

export function isValidSettingsTabId(value: string): value is SettingsTabId {
  return SETTINGS_TABS.some((tab) => tab.id === value);
}
