import api from './client';

export interface AuthUser {
  id:       number;
  username: string;
  email:    string;
  role?:    'user' | 'admin' | 'superuser';
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

function storeAuthToken(data: AuthResponse | { access_token?: string; token?: string }) {
  const token = 'token' in data ? data.token : data.access_token;
  if (!token) {
    throw new Error('Auth response did not contain a token.');
  }
  localStorage.setItem('smartprep_token', token);
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  storeAuthToken(data);
  return data;
}

export async function registerApi(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { username, email, password });
  storeAuthToken(data);
  return data;
}

export async function getMeApi(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export function clearToken(): void {
  localStorage.removeItem('smartprep_token');
}

export async function updateProfileApi(username: string): Promise<{ ok: boolean; username: string }> {
  const { data } = await api.patch<{ ok: boolean; username: string }>('auth/profile', { username });
  return data;
}

export async function changePasswordApi(currentPassword: string, newPassword: string): Promise<void> {
  await api.patch('auth/password', { currentPassword, newPassword });
}
