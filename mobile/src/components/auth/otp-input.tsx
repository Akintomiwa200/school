import { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const colors = useThemeColors();
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const updateAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, 6));
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            value={digit}
            editable={!disabled}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => {
              const char = text.replace(/\D/g, "").slice(-1);
              updateAt(index, char);
              if (char && index < 5) inputsRef.current[index + 1]?.focus();
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
              }
            }}
            style={{
              width: 44,
              height: 52,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: error ? colors.destructive : colors.border,
              backgroundColor: colors.card,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "700",
              color: colors.foreground,
            }}
          />
        ))}
      </View>
      {error ? <Text style={{ textAlign: "center", color: colors.destructive, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}
