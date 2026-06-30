import { useTheme } from "@/providers/theme-context";

/** Semantic colors for StyleSheet / inline styles — mirrors web CSS tokens. */
export function useThemeColors() {
  const { colors } = useTheme();

  return {
    background: colors.background,
    foreground: colors.foreground,
    text: colors.foreground,
    card: colors.card,
    cardForeground: colors.cardForeground,
    border: colors.border,
    icon: colors.mutedForeground,
    muted: colors.mutedForeground,
    mutedBackground: colors.muted,
    primary: colors.primary,
    primaryForeground: colors.primaryForeground,
    secondary: colors.secondary,
    secondaryForeground: colors.secondaryForeground,
    accent: colors.accent,
    destructive: colors.destructive,
    ring: colors.ring,
    canvas: colors.canvas,
    surfaceIndigo: colors.surfaceIndigo,
    link: colors.link,
  };
}
