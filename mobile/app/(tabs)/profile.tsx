import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-xl font-bold text-foreground">Profile</Text>
      <Text className="mt-2 text-muted-foreground">Manage your profile and settings.</Text>
    </View>
  );
}
