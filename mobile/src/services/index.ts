import { mobileConfig } from "@/config";
import { apiRequest } from "@/lib/api";
import {
  clearAuth,
  clearPendingAuthToken,
  clearVerifyContext,
  getPendingAuthToken,
  getToken,
  savePendingAuthToken,
  saveToken,
  saveUser,
  saveVerifyContext,
  type StoredUser,
  type VerifyContext,
} from "@/lib/auth-storage";
import { API_ENDPOINTS } from "@/shared/constants";

function maskEmail(email: string) {
  return email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
}

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await apiRequest<{
      email: string;
      flow: "login";
      devCode?: string;
      pendingToken: string;
    }>(API_ENDPOINTS.AUTH_LOGIN.replace("/api/v1", ""), {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.data?.pendingToken) {
      await savePendingAuthToken(res.data.pendingToken);
      await saveVerifyContext({
        email: res.data.email,
        maskedEmail: maskEmail(res.data.email),
        flow: res.data.flow,
        pendingToken: res.data.pendingToken,
      });
    }

    return res;
  },

  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
    phone?: string;
  }) => {
    const res = await apiRequest<{
      email: string;
      flow: "signup";
      devCode?: string;
      pendingToken: string;
    }>(API_ENDPOINTS.AUTH_REGISTER.replace("/api/v1", ""), {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.data?.pendingToken) {
      await savePendingAuthToken(res.data.pendingToken);
      await saveVerifyContext({
        email: res.data.email,
        maskedEmail: maskEmail(res.data.email),
        flow: res.data.flow,
        pendingToken: res.data.pendingToken,
      });
    }

    return res;
  },

  getVerifyCodeContext: async (): Promise<VerifyContext> => {
    const stored = await getVerifyContext();
    if (stored) return stored;

    const pendingToken = await getPendingAuthToken();
    if (!pendingToken) throw new Error("Verification session expired");

    const res = await apiRequest<{
      email: string;
      maskedEmail: string;
      flow: "login" | "signup";
    }>(API_ENDPOINTS.AUTH_VERIFY_CODE.replace("/api/v1", ""), {
      pendingToken,
    });

    const context: VerifyContext = {
      email: res.data!.email,
      maskedEmail: res.data!.maskedEmail,
      flow: res.data!.flow,
      pendingToken,
    };
    await saveVerifyContext(context);
    return context;
  },

  verifyCode: async (code: string) => {
    const pendingToken = await getPendingAuthToken();
    if (!pendingToken) throw new Error("Verification session expired");

    return apiRequest<{
      email: string;
      flow: "login" | "signup";
      otpSessionToken: string;
      onboardingCompleted: boolean;
    }>(API_ENDPOINTS.AUTH_VERIFY_CODE.replace("/api/v1", ""), {
      method: "POST",
      body: JSON.stringify({ code }),
      pendingToken,
    });
  },

  createSession: async (email: string, otpSessionToken: string) => {
    const res = await apiRequest<{ accessToken: string; user: StoredUser }>(
      API_ENDPOINTS.AUTH_SESSION.replace("/api/v1", ""),
      {
        method: "POST",
        body: JSON.stringify({ email, otpSessionToken }),
      },
    );

    if (res.data?.accessToken) {
      await saveToken(res.data.accessToken);
      await saveUser(res.data.user);
      await clearPendingAuthToken();
      await clearVerifyContext();
    }

    return res;
  },

  resendCode: async () => {
    const pendingToken = await getPendingAuthToken();
    if (!pendingToken) throw new Error("Verification session expired");

    return apiRequest<{ devCode?: string }>(API_ENDPOINTS.AUTH_VERIFY_CODE.replace("/api/v1", ""), {
      method: "PUT",
      pendingToken,
    });
  },

  forgotPassword: async (data: { email: string }) =>
    apiRequest<{ devResetUrl?: string }>(API_ENDPOINTS.AUTH_FORGOT_PASSWORD.replace("/api/v1", ""), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: async (data: { token: string; password: string; confirmPassword: string }) =>
    apiRequest(API_ENDPOINTS.AUTH_RESET_PASSWORD.replace("/api/v1", ""), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  validateResetToken: async (token: string) => {
    try {
      const res = await fetch(
        `${mobileConfig.apiUrl}${API_ENDPOINTS.AUTH_RESET_PASSWORD.replace("/api/v1", "")}?token=${encodeURIComponent(token)}`,
        { headers: { "Content-Type": "application/json" } },
      );
      return res.ok;
    } catch {
      return false;
    }
  },

  me: async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return apiRequest<StoredUser>(API_ENDPOINTS.AUTH_ME.replace("/api/v1", ""), { token });
  },

  signOut: async () => {
    await clearAuth();
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
