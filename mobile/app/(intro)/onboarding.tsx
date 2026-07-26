import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CybexLogo, OnboardingDots, ONBOARDING_SLIDES } from "@/components/intro";
import { setIntroCompleted } from "@/lib/intro-storage";

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  const finish = async () => {
    await setIntroCompleted();
    router.replace("/(auth)/login");
  };

  const onContinue = () => {
    if (isLast) {
      void finish();
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-5 pt-2">
        <TouchableOpacity onPress={() => void finish()} hitSlop={12}>
          <Text className="text-sm font-semibold tracking-wide text-foreground">SKIP</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        <View className="flex-1 items-center justify-center">
          <View className="mb-10 h-64 w-64 items-center justify-center rounded-full bg-[#e8e8e8]">
            <CybexLogo size="sm" />
          </View>

          <Text className="text-center text-2xl font-bold leading-8 text-foreground">{slide.title}</Text>
          <Text className="mt-4 text-center text-base leading-6 text-muted-foreground">{slide.description}</Text>
        </View>

        <View className="pb-4">
          <OnboardingDots total={ONBOARDING_SLIDES.length} activeIndex={step} />

          <TouchableOpacity
            className="mt-8 rounded-2xl bg-black py-4"
            activeOpacity={0.85}
            onPress={onContinue}
          >
            <Text className="text-center text-sm font-bold tracking-[0.2em] text-white">CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
