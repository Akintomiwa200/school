import { mobileConfig } from "@/config";

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export class NetworkError extends Error {
  constructor(message = "No internet connection") {
    super(message);
    this.name = "NetworkError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit & { token?: string; pendingToken?: string },
): Promise<ApiResult<T>> {
  const { token, pendingToken, ...fetchOptions } = options ?? {};

  let res: Response;
  try {
    res = await fetch(`${mobileConfig.apiUrl}${endpoint}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(pendingToken && { "X-Pending-Auth": pendingToken }),
        ...fetchOptions.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  const json = (await res.json().catch(() => ({}))) as ApiResult<T>;

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? json.error ?? `Request failed: ${res.status}`);
  }

  return json;
}
