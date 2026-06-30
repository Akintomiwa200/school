import { Redirect } from "expo-router";
import { View } from "react-native";

import { NoNetworkScreen } from "@/components/network/no-network-screen";
import { useBootstrap } from "@/providers/bootstrap-context";

/**
 * Entry routing after splash + bootstrap:
 * splash (3s) → network check → onboarding (first launch) → auth or tabs
 */
export function StartupRouter() {
  const { isReady, isOnline, hasSeenOnboarding, isAuthenticated } = useBootstrap();

  if (!isReady) {
    return <View style={{ flex: 1 }} />;
  }

  if (!isOnline) {
    return <NoNetworkScreen />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
