import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>School mobile</Text>
        <Text style={styles.heroSubtitle}>
          Your dashboard on the go — explore features and open quick actions.
        </Text>
      </View>

      <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Quick actions</Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => router.push("/(tabs)/explore")}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.actionButtonText}>Open explore</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/modal")}
            style={({ pressed }) => [
              styles.actionButtonSecondary,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.actionButtonSecondaryText}>Open modal</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Theme</Text>
        <Text style={[styles.muted, { color: colors.icon }]}>
          Colors follow light/dark mode from the device.
        </Text>
      </View>
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
    gap: 16,
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    gap: 10,
    backgroundColor: "#0a7ea4",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  actionButtonSecondary: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(10,126,164,0.12)",
  },
  actionButtonSecondaryText: {
    color: "#0a7ea4",
    fontWeight: "700",
  },
});
