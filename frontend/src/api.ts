import { getAccessToken, clearTokens } from './auth/authStore';
import { refresh as refreshTokens } from './auth/authApi';

type ApiErrorResponse = {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors ?? {};
  }
}

async function parseApiError(res: Response): Promise<ApiError> {
  const status = res.status;
  try {
    const data = (await res.json()) as ApiErrorResponse;
    const msg = data?.message || `${status} ${res.statusText}`;
    return new ApiError(msg, status, data?.fieldErrors);
  } catch {
    return new ApiError(`${status} ${res.statusText}`, status);
  }
}

type RequestOpts = {
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(url: string, opts: RequestOpts, retry = true): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  // Attach Bearer only for content-service calls
  if (url.startsWith('/api/v1/content/')) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method: opts.method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  // If 401 on content-service, refresh once then retry
  if (res.status === 401 && retry && url.startsWith('/api/')) {
    try {
      await refreshTokens();
      return request<T>(url, opts, false);
    } catch {
      clearTokens();
      throw new ApiError('Unauthorized', 401);
    }
  }

  if (!res.ok) throw await parseApiError(res);

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const apiGet = <T>(url: string) => request<T>(url, { method: 'GET' });
export const apiPost = <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body });
export const apiPut = <T>(url: string, body: unknown) => request<T>(url, { method: 'PUT', body });
export const apiPatchNoContent = (url: string) => request<void>(url, { method: 'PATCH' });
export const apiPatchJson = <T>(url: string, body?: unknown) =>
  request<T>(url, { method: 'PATCH', body });
export const apiDelete = <T>(url: string) => request<T>(url, { method: 'DELETE' });
