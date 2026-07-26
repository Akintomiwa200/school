import * as SecureStore from "expo-secure-store";

const INTRO_COMPLETED_KEY = "intro_completed";

export async function isIntroCompleted() {
  const value = await SecureStore.getItemAsync(INTRO_COMPLETED_KEY);
  return value === "true";
}

export async function setIntroCompleted() {
  await SecureStore.setItemAsync(INTRO_COMPLETED_KEY, "true");
}
