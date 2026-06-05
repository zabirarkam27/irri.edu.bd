import { siteConfig } from "@/config/site";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
};

export async function apiGet<T>(path: string, fallback: T, revalidate = 60): Promise<T> {
  try {
    const response = await fetch(`${siteConfig.apiBaseUrl}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" }
    });

    if (!response.ok) return fallback;
    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function apiPost<TPayload, TResult>(path: string, payload: TPayload): Promise<ApiResponse<TResult>> {
  const response = await fetch(`${siteConfig.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = (await response.json()) as ApiResponse<TResult>;
  if (!response.ok || !result.success) throw new Error(result.message || "Request failed");
  return result;
}
