import { API_ENDPOINTS } from "@/shared/constants";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const studentService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return request(`${API_ENDPOINTS.STUDENTS}${query}`);
  },
  getById: (id: string) => request(API_ENDPOINTS.STUDENTS_BY_ID(id)),
  create: (data: unknown) => request(API_ENDPOINTS.STUDENTS, { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(API_ENDPOINTS.STUDENTS_BY_ID(id), { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(API_ENDPOINTS.STUDENTS_BY_ID(id), { method: "DELETE" }),
};

export const courseService = {
  getAll: () => request(API_ENDPOINTS.COURSES),
  getById: (id: string) => request(API_ENDPOINTS.COURSES_BY_ID(id)),
  create: (data: unknown) => request(API_ENDPOINTS.COURSES, { method: "POST", body: JSON.stringify(data) }),
};

export const feeService = {
  getAll: () => request(API_ENDPOINTS.FEES),
  getById: (id: string) => request(API_ENDPOINTS.FEES_BY_ID(id)),
  create: (data: unknown) => request(API_ENDPOINTS.FEES, { method: "POST", body: JSON.stringify(data) }),
};

export const paymentService = {
  getAll: () => request(API_ENDPOINTS.PAYMENTS),
  getById: (id: string) => request(API_ENDPOINTS.PAYMENTS_BY_ID(id)),
  create: (data: unknown) => request(API_ENDPOINTS.PAYMENTS, { method: "POST", body: JSON.stringify(data) }),
};

export const attendanceService = {
  getAll: () => request(API_ENDPOINTS.ATTENDANCE),
  markBulk: (data: unknown) => request(API_ENDPOINTS.ATTENDANCE_BULK, { method: "POST", body: JSON.stringify(data) }),
};

export const auditService = {
  getAll: () => request(API_ENDPOINTS.AUDIT),
  export: () => request(API_ENDPOINTS.AUDIT_EXPORT),
};
