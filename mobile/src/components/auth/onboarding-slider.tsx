import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui";
import { onboardingSteps } from "@/config/app";
import { markAppOnboardingComplete } from "@/lib/auth-storage";
import { useBootstrap } from "@/providers/bootstrap-context";
import { useThemeColors } from "@/hooks/use-theme-colors";

const { width } = Dimensions.get("window");

const iconMap = {
  school: "school",
  calendar: "calendar",
  notifications: "notifications",
} as const;

export function OnboardingSlider() {
  const router = useRouter();
  const colors = useThemeColors();
  const { markOnboardingSeen } = useBootstrap();
  const listRef = useRef<FlatList<(typeof onboardingSteps)[number]>>(null);
  const [step, setStep] = useState(0);

  const finish = async () => {
    await markAppOnboardingComplete();
    markOnboardingSeen();
    router.replace("/(auth)/login");
  };

  const goNext = () => {
    if (step >= onboardingSteps.length - 1) {
      void finish();
      return;
    }
    const next = step + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setStep(next);
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setStep(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 48, paddingBottom: 32 }}>
      <FlatList
        ref={listRef}
        data={[...onboardingSteps]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => {
          const iconName = iconMap[item.icon];
          return (
            <View style={{ width, paddingHorizontal: 28, justifyContent: "center", gap: 20 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${colors.primary}22`,
                }}
              >
                <Ionicons name={iconName} size={34} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 30, fontWeight: "800", color: colors.foreground }}>{item.title}</Text>
              <Text style={{ fontSize: 16, lineHeight: 24, color: colors.muted }}>{item.body}</Text>
            </View>
          );
        }}
      />

      <View style={{ paddingHorizontal: 28, gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {onboardingSteps.map((item, index) => (
            <View
              key={item.title}
              style={{
                width: index === step ? 24 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: index === step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        <Button
          label={step === onboardingSteps.length - 1 ? "Get started" : "Next"}
          onPress={goNext}
        />
        {step < onboardingSteps.length - 1 ? (
          <Button label="Skip" variant="ghost" onPress={() => void finish()} />
        ) : null}
      </View>
    </View>
  );
}
