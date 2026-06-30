import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const PENDING_AUTH_KEY = "pending_auth_token";
const VERIFY_CONTEXT_KEY = "verify_context";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  onboardingCompleted: boolean;
};

export type VerifyContext = {
  email: string;
  maskedEmail: string;
  flow: "login" | "signup";
  pendingToken: string;
};

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveUser(user: StoredUser) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? (JSON.parse(user) as StoredUser) : null;
}

export async function savePendingAuthToken(token: string) {
  await SecureStore.setItemAsync(PENDING_AUTH_KEY, token);
}

export async function getPendingAuthToken() {
  return SecureStore.getItemAsync(PENDING_AUTH_KEY);
}

export async function clearPendingAuthToken() {
  await SecureStore.deleteItemAsync(PENDING_AUTH_KEY);
}

export async function saveVerifyContext(context: VerifyContext) {
  await SecureStore.setItemAsync(VERIFY_CONTEXT_KEY, JSON.stringify(context));
}

export async function getVerifyContext(): Promise<VerifyContext | null> {
  const value = await SecureStore.getItemAsync(VERIFY_CONTEXT_KEY);
  return value ? (JSON.parse(value) as VerifyContext) : null;
}

export async function clearVerifyContext() {
  await SecureStore.deleteItemAsync(VERIFY_CONTEXT_KEY);
}

export async function clearAuth() {
  await Promise.all([
    removeToken(),
    SecureStore.deleteItemAsync(USER_KEY),
    clearPendingAuthToken(),
    clearVerifyContext(),
  ]);
}

export async function hasSeenAppOnboarding() {
  const value = await SecureStore.getItemAsync("school-lms-app-onboarding-complete");
  return value === "true";
}

export async function markAppOnboardingComplete() {
  await SecureStore.setItemAsync("school-lms-app-onboarding-complete", "true");
}
