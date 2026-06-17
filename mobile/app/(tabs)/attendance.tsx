import { View, Text } from "react-native";

export default function AttendanceScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-xl font-bold text-foreground">Attendance</Text>
      <Text className="mt-2 text-muted-foreground">View your attendance records here.</Text>
    </View>
  );
}
