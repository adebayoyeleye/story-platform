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

  // Try to parse JSON error body (our ApiErrorResponse)
  try {
    const data = (await res.json()) as ApiErrorResponse;

    const msg =
      data?.message ||
      `${status} ${res.statusText}`;

    return new ApiError(msg, status, data?.fieldErrors);
  } catch {
    // fallback: non-json error
    return new ApiError(`${status} ${res.statusText}`, status);
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}

export async function apiPatchNoContent(url: string): Promise<void> {
  const res = await fetch(url, { method: 'PATCH' });
  if (!res.ok) throw await parseApiError(res);
}

export async function apiPatchJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json();
}
