import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const mobileConfig = {
  apiUrl: API_URL,
  appName: "School LMS",
};
