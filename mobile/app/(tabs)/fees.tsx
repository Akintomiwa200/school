import { View, Text } from "react-native";

export default function FeesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-xl font-bold text-foreground">Fees & Payments</Text>
      <Text className="mt-2 text-muted-foreground">View and pay school fees here.</Text>
    </View>
  );
}
