import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { networkErrors } from "@/config/app";
import { useBootstrap } from "@/providers/bootstrap-context";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function NoNetworkScreen() {
  const colors = useThemeColors();
  const { refreshNetwork } = useBootstrap();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 28, gap: 20 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${colors.destructive}18`,
          }}
        >
          <Ionicons name="cloud-offline" size={34} color={colors.destructive} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground }}>
          {networkErrors.title}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: colors.muted }}>{networkErrors.message}</Text>
        <Button label={networkErrors.retryLabel} onPress={() => void refreshNetwork()} />
      </View>
    </SafeAreaView>
  );
}
