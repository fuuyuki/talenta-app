export type UserRole = 'admin' | 'mentor' | 'mentee';

export type AuthUser = {
  id: string;
  email: string;
  roles: UserRole[];
};

export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Accepts both the new `roles: []` shape and the legacy `role: string` shape,
 * so existing browser sessions survive the migration.
 */
export function normalizeStoredUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : '';
  const email = typeof record.email === 'string' ? record.email : '';

  const rawRoles = Array.isArray(record.roles)
    ? record.roles
    : typeof record.role === 'string'
      ? [record.role]
      : [];

  const roles = rawRoles.filter(
    (role): role is UserRole =>
      role === 'admin' || role === 'mentor' || role === 'mentee',
  );

  if (!id || !email || roles.length === 0) return null;

  return { id, email, roles };
}

export function saveSession(response: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, response.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function getSession(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;

  try {
    const user = normalizeStoredUser(JSON.parse(rawUser));
    if (!user) {
      clearSession();
      return null;
    }
    return { token, user };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
