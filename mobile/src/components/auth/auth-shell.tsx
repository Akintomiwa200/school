import { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColors } from "@/hooks/use-theme-colors";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 24,
            gap: 16,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground }}>{title}</Text>
            {subtitle ? (
              <Text style={{ fontSize: 15, lineHeight: 22, color: colors.muted }}>{subtitle}</Text>
            ) : null}
          </View>
          {children}
        </View>
        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}
