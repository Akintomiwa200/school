import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import { API_ENDPOINTS } from "@/shared/constants";

export const authService = {
  login: async (email: string, password: string) => {
    const token = await getToken();
    return apiRequest(API_ENDPOINTS.AUTH_LOGIN.replace("/api/v1", ""), {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: token ?? undefined,
    });
  },
  me: async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return apiRequest(API_ENDPOINTS.AUTH_ME.replace("/api/v1", ""), { token });
  },
};

export const courseService = {
  getAll: async () => {
    const token = await getToken();
    return apiRequest("/courses", { token: token ?? undefined });
  },
};

export const attendanceService = {
  getAll: async () => {
    const token = await getToken();
    return apiRequest("/attendance", { token: token ?? undefined });
  },
};

export const feeService = {
  getAll: async () => {
    const token = await getToken();
    return apiRequest("/fees", { token: token ?? undefined });
  },
};

export const notificationService = {
  getAll: async () => {
    const token = await getToken();
    return apiRequest("/notifications", { token: token ?? undefined });
  },
};

export { uploadService } from "./upload.service";
