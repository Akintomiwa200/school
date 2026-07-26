import { View } from "react-native";
import Svg, { Path, Polygon } from "react-native-svg";
import { Text } from "react-native";

type CybexLogoProps = {
  size?: "sm" | "lg";
};

export function CybexLogo({ size = "lg" }: CybexLogoProps) {
  const iconSize = size === "lg" ? 72 : 48;
  const labelClass = size === "lg" ? "text-3xl tracking-[0.35em]" : "text-xl tracking-[0.3em]";

  return (
    <View className="items-center">
      <Svg width={iconSize} height={iconSize} viewBox="0 0 72 72" fill="none">
        <Polygon points="8,56 36,8 64,56 48,56 36,36 24,56" fill="#1d4ed8" />
        <Path d="M36 20 L52 48 H44 L36 34 L28 48 H20 Z" fill="#ffffff" opacity={0.95} />
      </Svg>
      <Text className={`mt-3 font-bold text-[#1d4ed8] ${labelClass}`}>CYBEX</Text>
    </View>
  );
}
