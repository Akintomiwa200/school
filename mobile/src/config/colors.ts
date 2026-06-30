/**
 * Semantic color tokens aligned with web/src/styles/globals.css
 * and web/src/config/design.ts — keep in sync when the web palette changes.
 */

export const themeColors = {
  light: {
    primary: "#5865f2",
    primaryForeground: "#ffffff",
    green: "#35ed7e",
    magenta: "#ec48bd",
    link: "#00b0f4",
    canvas: "#0a0d3a",
    surfaceIndigo: "#1e2353",
    surfaceOnyx: "#23272a",
    background: "#f3f5fa",
    foreground: "#1e293b",
    card: "#ffffff",
    cardForeground: "#1e293b",
    secondary: "#f1f5f9",
    secondaryForeground: "#1e293b",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#5865f2",
    accent: "#ec48bd",
    accentForeground: "#ffffff",
    destructive: "#ed4245",
    destructiveForeground: "#ffffff",
  },
  dark: {
    primary: "#5865f2",
    primaryForeground: "#ffffff",
    green: "#35ed7e",
    magenta: "#ec48bd",
    link: "#00b0f4",
    canvas: "#0a0d3a",
    surfaceIndigo: "#1e2353",
    surfaceOnyx: "#23272a",
    background: "#0a0d3a",
    foreground: "#ffffff",
    card: "#1e2353",
    cardForeground: "#ffffff",
    secondary: "#23272a",
    secondaryForeground: "#ffffff",
    muted: "#1e2353",
    mutedForeground: "#a0a4b8",
    border: "#2e3568",
    input: "#2e3568",
    ring: "#5865f2",
    accent: "#ec48bd",
    accentForeground: "#ffffff",
    destructive: "#ed4245",
    destructiveForeground: "#ffffff",
  },
} as const;

export type ThemeMode = keyof typeof themeColors;
export type ThemePreference = ThemeMode | "system";

export const THEME_STORAGE_KEY = "school-lms-theme";
