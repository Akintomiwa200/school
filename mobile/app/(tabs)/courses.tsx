import { View, Text } from "react-native";

export default function CoursesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-xl font-bold text-foreground">My Courses</Text>
      <Text className="mt-2 text-muted-foreground">Online and offline courses will appear here.</Text>
    </View>
  );
}
