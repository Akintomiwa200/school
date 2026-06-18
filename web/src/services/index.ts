import { API_ENDPOINTS } from "@/shared/constants";

type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  const json = (await res.json()) as ApiResult<T>;

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? json.error ?? `Request failed: ${res.status}`);
  }

  return json;
}

export const authService = {
  me: () => request(API_ENDPOINTS.AUTH_ME),
  login: (data: unknown) =>
    request<{ email: string; flow: "login"; devCode?: string }>(API_ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: unknown) =>
    request<{ email: string; flow: "signup"; devCode?: string }>(API_ENDPOINTS.AUTH_REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getVerifyCodeContext: () =>
    request<{ email: string; maskedEmail: string; flow: "login" | "signup" }>(
      API_ENDPOINTS.AUTH_VERIFY_CODE,
    ),
  verifyCode: (data: unknown) =>
    request<{
      email: string;
      flow: "login" | "signup";
      otpSessionToken: string;
      onboardingCompleted: boolean;
    }>(API_ENDPOINTS.AUTH_VERIFY_CODE, { method: "POST", body: JSON.stringify(data) }),
  resendCode: () =>
    request<{ devCode?: string }>(API_ENDPOINTS.AUTH_VERIFY_CODE, { method: "PUT" }),
  getOnboarding: () =>
    request<{ onboardingCompleted: boolean; onboardingData: unknown; referralSource: string | null }>(
      API_ENDPOINTS.AUTH_ONBOARDING,
    ),
  saveOnboarding: (data: unknown) =>
    request(API_ENDPOINTS.AUTH_ONBOARDING, { method: "POST", body: JSON.stringify(data) }),
  completeOnboarding: () =>
    request(API_ENDPOINTS.AUTH_ONBOARDING, { method: "PATCH" }),
  forgotPassword: (data: unknown) =>
    request(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { method: "POST", body: JSON.stringify(data) }),
  resetPassword: (data: unknown) =>
    request(API_ENDPOINTS.AUTH_RESET_PASSWORD, { method: "POST", body: JSON.stringify(data) }),
};

export const studentService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return request(`${API_ENDPOINTS.STUDENTS}${query}`);
  },
  getById: (id: string) => request(API_ENDPOINTS.STUDENTS_BY_ID(id)),
  create: (data: unknown) =>
    request(API_ENDPOINTS.STUDENTS, { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) =>
    request(API_ENDPOINTS.STUDENTS_BY_ID(id), { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(API_ENDPOINTS.STUDENTS_BY_ID(id), { method: "DELETE" }),
};

export const courseService = {
  getAll: () => request(API_ENDPOINTS.COURSES),
  getById: (id: string) => request(API_ENDPOINTS.COURSES_BY_ID(id)),
  create: (data: unknown) =>
    request(API_ENDPOINTS.COURSES, { method: "POST", body: JSON.stringify(data) }),
};

export const feeService = {
  getAll: () => request(API_ENDPOINTS.FEES),
  getById: (id: string) => request(API_ENDPOINTS.FEES_BY_ID(id)),
  create: (data: unknown) =>
    request(API_ENDPOINTS.FEES, { method: "POST", body: JSON.stringify(data) }),
};

export const paymentService = {
  getAll: () => request(API_ENDPOINTS.PAYMENTS),
  getById: (id: string) => request(API_ENDPOINTS.PAYMENTS_BY_ID(id)),
  create: (data: unknown) =>
    request(API_ENDPOINTS.PAYMENTS, { method: "POST", body: JSON.stringify(data) }),
};

export const attendanceService = {
  getAll: () => request(API_ENDPOINTS.ATTENDANCE),
  markBulk: (data: unknown) =>
    request(API_ENDPOINTS.ATTENDANCE_BULK, { method: "POST", body: JSON.stringify(data) }),
};

export const notificationService = {
  getAll: () => request(API_ENDPOINTS.NOTIFICATIONS),
  getById: (id: string) => request(API_ENDPOINTS.NOTIFICATIONS_BY_ID(id)),
  markRead: (id: string) =>
    request(API_ENDPOINTS.NOTIFICATIONS_BY_ID(id), {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
    }),
};

export const auditService = {
  getAll: () => request(API_ENDPOINTS.AUDIT),
  export: () => request(API_ENDPOINTS.AUDIT_EXPORT),
};
