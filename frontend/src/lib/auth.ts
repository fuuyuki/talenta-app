export type UserRole = 'admin' | 'mentor' | 'mentee';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function saveSession(response: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, response.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function getSession(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) as AuthUser };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
