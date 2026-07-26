import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui";
import { useBootstrap } from "@/providers/bootstrap-context";
import { authService } from "@/services";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user, refreshAuth } = useBootstrap();

  const onSignOut = async () => {
    await authService.signOut();
    await refreshAuth();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground }}>Profile</Text>
      {user ? (
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{user.name}</Text>
          <Text style={{ color: colors.muted }}>{user.email}</Text>
          <Text style={{ color: colors.muted }}>Role: {user.role}</Text>
        </View>
      ) : null}
      <Button label="Sign out" variant="secondary" onPress={() => void onSignOut()} />
    </View>
  );
}
