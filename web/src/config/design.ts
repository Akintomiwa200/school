/** Discord-inspired marketing design tokens (see design.md) */

export const colors = {
  primary: "#5865f2",
  green: "#35ed7e",
  magenta: "#ec48bd",
  link: "#00b0f4",
  canvas: "#0a0d3a",
  surfaceIndigo: "#1e2353",
  surfaceOnyx: "#23272a",
  surfaceBlack: "#000000",
  ink: "#ffffff",
  inkDark: "#000000",
  mutedInk: "#333333",
  onPrimary: "#ffffff",
} as const;

export const spacing = {
  xxs: "4px",
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  xxl: "32px",
  section: "40px",
} as const;

export const rounded = {
  xs: "6px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "40px",
  pill: "50px",
  jumbo: "120px",
  full: "9999px",
} as const;

export const typography = {
  displayXl: { size: "82px", weight: 800, lineHeight: 1, letterSpacing: "0" },
  displayLg: { size: "62px", weight: 800, lineHeight: 1.05, letterSpacing: "0" },
  displayMd: { size: "56px", weight: 700, lineHeight: 1.05, letterSpacing: "0" },
  headingLg: { size: "48px", weight: 700, lineHeight: 1.1, letterSpacing: "0" },
  headingSm: { size: "22px", weight: 700, lineHeight: 1.2, letterSpacing: "0" },
  bodyLg: { size: "20px", weight: 500, lineHeight: 1.4, letterSpacing: "0" },
  linkLg: { size: "18px", weight: 500, lineHeight: 1.4, letterSpacing: "0" },
  body: { size: "16px", weight: 400, lineHeight: 1.5, letterSpacing: "0" },
  link: { size: "16px", weight: 500, lineHeight: 1.4, letterSpacing: "0" },
  linkSm: { size: "14px", weight: 500, lineHeight: 1.4, letterSpacing: "0" },
} as const;

export const shadows = {
  float: "0 3px 68px rgba(69, 42, 124, 0.1)",
} as const;

export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1280,
} as const;

export const container = {
  maxWidth: "1200px",
} as const;

export const designConfig = {
  colors,
  spacing,
  rounded,
  typography,
  shadows,
  breakpoints,
  container,
} as const;

export type DesignColors = keyof typeof colors;
export type TypographyToken = keyof typeof typography;
