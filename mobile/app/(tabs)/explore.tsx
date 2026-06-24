import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

const FEATURES = [
  {
    title: "Courses & assignments",
    body: "Track classes, deadlines, and submissions from one place.",
  },
  {
    title: "Grades & attendance",
    body: "View report cards, term GPA, and daily attendance records.",
  },
  {
    title: "Fees & library",
    body: "Pay school fees and browse digital or physical library resources.",
  },
  {
    title: "Messages & announcements",
    body: "Stay in sync with teachers, staff, and school-wide updates.",
  },
];

export default function ExploreScreen() {
  const colors = useThemeColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        What you can do in the school app once signed in.
      </Text>

      {FEATURES.map((feature) => (
        <View
          key={feature.title}
          style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>{feature.title}</Text>
          <Text style={[styles.cardBody, { color: colors.icon }]}>{feature.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
