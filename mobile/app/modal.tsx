import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

export default function ModalScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Modal" }} />
      <Text style={[styles.title, { color: colors.text }]}>Example modal</Text>
      <Text style={[styles.body, { color: colors.icon }]}>
        Use modals for quick flows — confirmations, previews, or short forms.
      </Text>
      <Link href="/" dismissTo asChild>
        <Pressable style={({ pressed }) => [styles.link, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.linkText}>Go to home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#0a7ea4",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  linkText: {
    color: "#fff",
    fontWeight: "700",
  },
});
