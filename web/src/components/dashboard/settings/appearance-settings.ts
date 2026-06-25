import { useUIStore } from "@/store/ui.store";
import type { AppearanceForm } from "./settings-data";
import type { AccessibilityForm } from "./settings-data";

export const APPEARANCE_STORAGE_KEY = "school-lms-appearance";
export const ACCESSIBILITY_STORAGE_KEY = "school-lms-accessibility";

const ACCENT_TOKENS: Record<AppearanceForm["accent"], { brand: string; primary: string }> = {
  purple: { brand: "#5d21d0", primary: "#5d21d0" },
  blue: { brand: "#2563eb", primary: "#2563eb" },
  green: { brand: "#16a34a", primary: "#16a34a" },
  orange: { brand: "#ea580c", primary: "#ea580c" },
};

const FONT_SIZES: Record<AppearanceForm["fontSize"], string> = {
  sm: "93.75%",
  md: "100%",
  lg: "106.25%",
};

function applyAccentTokens(accent: AppearanceForm["accent"]) {
  const root = document.documentElement;
  const tokens = ACCENT_TOKENS[accent];
  root.dataset.accent = accent;
  root.style.setProperty("--color-brand-purple", tokens.brand);
  root.style.setProperty("--color-primary", tokens.primary);
  root.style.setProperty("--color-ring", tokens.primary);
  root.style.setProperty("--color-sidebar-primary", tokens.primary);
}

function applyDensity(density: AppearanceForm["density"]) {
  const root = document.documentElement;
  root.dataset.density = density;

  const scale = density === "compact" ? "0.88" : density === "spacious" ? "1.14" : "1";
  const padding = density === "compact" ? "1rem" : density === "spacious" ? "2rem" : "1.5rem";
  root.style.setProperty("--app-density-scale", scale);
  root.style.setProperty("--app-main-padding", padding);
}

export function applyAppearance(
  appearance: AppearanceForm,
  setTheme?: (theme: string) => void,
) {
  if (typeof document === "undefined") return;

  if (setTheme) {
    setTheme(appearance.theme);
  }

  const root = document.documentElement;
  const body = document.body;
  const fontSize = FONT_SIZES[appearance.fontSize] ?? "100%";

  root.style.fontSize = fontSize;
  if (body) body.style.fontSize = fontSize;
  applyAccentTokens(appearance.accent);
  applyDensity(appearance.density);
  root.dataset.sidebar = appearance.sidebarStyle;

  useUIStore.getState().setSidebarBehavior(appearance.sidebarStyle);

  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // ignore
  }
}

export function applyAccessibility(accessibility: AccessibilityForm) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("reduce-motion", accessibility.reducedMotion);
  root.classList.toggle("high-contrast", accessibility.highContrast);
  root.classList.toggle("large-targets", accessibility.largerClickTargets);
  root.classList.toggle("underline-links", accessibility.underlineLinks);
  root.classList.toggle("enhanced-focus", accessibility.focusIndicators);
  root.dataset.screenReader = accessibility.screenReaderOptimized ? "optimized" : "default";

  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(accessibility));
  } catch {
    // ignore
  }
}

export function loadStoredAppearance(): AppearanceForm | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppearanceForm;
  } catch {
    return null;
  }
}

export function loadStoredAccessibility(): AccessibilityForm | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AccessibilityForm;
  } catch {
    return null;
  }
}
