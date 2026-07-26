import { View } from "react-native";

type OnboardingDotsProps = {
  total: number;
  activeIndex: number;
};

export function OnboardingDots({ total, activeIndex }: OnboardingDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`h-2 w-2 rounded-full ${index === activeIndex ? "bg-foreground" : "bg-border"}`}
        />
      ))}
    </View>
  );
}
