import { Pressable, Text, type PressableProps } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

export function Button({ label, variant = "primary", loading, disabled, style, ...props }: ButtonProps) {
  const colors = useThemeColors();

  const backgroundColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : "transparent";

  const textColor =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "secondary"
        ? colors.secondaryForeground
        : colors.primary;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 18,
          backgroundColor,
          opacity: pressed || loading ? 0.85 : 1,
          alignItems: "center",
        },
        typeof style === "function" ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}
    >
      <Text style={{ color: textColor, fontWeight: "700", fontSize: 16 }}>
        {loading ? "Please wait…" : label}
      </Text>
    </Pressable>
  );
}
