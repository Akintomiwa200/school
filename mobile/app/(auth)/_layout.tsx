import { Redirect, Stack } from "expo-router";

import { NoNetworkScreen } from "@/components/network/no-network-screen";
import { useBootstrap } from "@/providers/bootstrap-context";

export default function AuthLayout() {
  const { isReady, isOnline, isAuthenticated } = useBootstrap();

  if (isReady && !isOnline) {
    return <NoNetworkScreen />;
  }

  if (isReady && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-code" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
