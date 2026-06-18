import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const mobileConfig = {
  apiUrl: extra?.apiUrl ?? "http://localhost:3000/api/v1",
  appName: "School LMS",
};
