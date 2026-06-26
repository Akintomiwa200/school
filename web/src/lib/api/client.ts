import type { ApiResponse } from "@/shared/types";

export class ApiClientError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    throw new ApiClientError(json.message ?? json.error ?? `Request failed: ${res.status}`, json.error);
  }

  return json;
}

export async function apiGet<T>(url: string): Promise<T> {
  const json = await apiRequest<T>(url);
  if (json.data === undefined) {
    throw new ApiClientError("No data in response");
  }
  return json.data;
}

export async function apiPost<T, B = unknown>(url: string, body: B): Promise<T> {
  const json = await apiRequest<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (json.data === undefined) {
    throw new ApiClientError("No data in response");
  }
  return json.data;
}

export async function apiPatch<T, B = unknown>(url: string, body: B): Promise<T> {
  const json = await apiRequest<T>(url, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (json.data === undefined) {
    throw new ApiClientError("No data in response");
  }
  return json.data;
}
