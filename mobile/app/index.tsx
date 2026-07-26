import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { isIntroCompleted } from "@/lib/intro-storage";

export default function Index() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const completed = await isIntroCompleted();
      setHref(completed ? "/(auth)/login" : "/(intro)/splash");
    })();
  }, []);

  if (!href) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#1d4ed8" />
      </View>
    );
  }

  return <Redirect href={href as "/(auth)/login" | "/(intro)/splash"} />;
}
