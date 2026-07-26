import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { CybexLogo } from "@/components/intro";
import { isIntroCompleted } from "@/lib/intro-storage";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function SplashScreenRoute() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const run = async () => {
      await SplashScreen.hideAsync().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 1600));

      if (!active) return;

      const completed = await isIntroCompleted();
      router.replace(completed ? "/(auth)/login" : "/(intro)/onboarding");
    };

    void run();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <CybexLogo />
    </View>
  );
}
