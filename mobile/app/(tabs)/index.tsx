import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-foreground">Dashboard</Text>
        <Text className="mt-1 text-muted-foreground">Welcome to School LMS Mobile</Text>

        <View className="mt-6 flex-row flex-wrap gap-3">
          {["Courses", "Attendance", "Grades", "Fees", "Messages", "Events"].map((item) => (
            <View key={item} className="w-[47%] rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-foreground">{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
