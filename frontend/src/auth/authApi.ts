import { setTokens, getRefreshToken, clearTokens } from './authStore';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  issuer: string;
};

export async function signup(payload: {
  email: string;
  password: string;
  appId: string;
  roles: string[];
}): Promise<AuthResponse> {
  const res = await fetch('/auth/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Signup failed (${res.status})`);
  const data: AuthResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
  appId: string;
}): Promise<AuthResponse> {
  const res = await fetch('/auth/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const data: AuthResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

/** Used internally by api.ts when it receives 401 */
export async function refresh(): Promise<AuthResponse> {
  const rt = getRefreshToken();
  if (!rt) throw new Error('Missing refresh token');

  const res = await fetch('/auth/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error(`Refresh failed (${res.status})`);
  }

  const data: AuthResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}
