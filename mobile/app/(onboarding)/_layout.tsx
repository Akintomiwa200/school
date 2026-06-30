import { Redirect, Stack } from "expo-router";

import { NoNetworkScreen } from "@/components/network/no-network-screen";
import { useBootstrap } from "@/providers/bootstrap-context";

export default function OnboardingLayout() {
  const { isReady, isOnline, hasSeenOnboarding } = useBootstrap();

  if (isReady && !isOnline) {
    return <NoNetworkScreen />;
  }

  if (isReady && hasSeenOnboarding) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
