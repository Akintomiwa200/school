import { Text, TextInput, View, type TextInputProps } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.destructive : colors.border,
            backgroundColor: colors.card,
            color: colors.foreground,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={{ color: colors.destructive, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}
