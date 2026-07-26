import Constants from "expo-constants";

export { themeColors, THEME_STORAGE_KEY, type ThemeMode, type ThemePreference } from "./colors";
export {
  appConfig,
  networkErrors,
  ONBOARDING_STORAGE_KEY,
  onboardingSteps,
} from "./app";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const mobileConfig = {
  apiUrl: extra?.apiUrl ?? "http://localhost:3000/api/v1",
  appName: "School LMS",
};
