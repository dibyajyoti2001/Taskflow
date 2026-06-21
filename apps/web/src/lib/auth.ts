import type { UserDto } from '@taskflow/shared';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
// 7 days in seconds — matches JWT_EXPIRES_IN on the API
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getStoredUser(): UserDto | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserDto;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: UserDto): void {
  // localStorage — read by the axios interceptor for API calls
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Cookie — read by Next.js middleware for route protection.
  // Middleware runs on the edge before the page renders and cannot access
  // localStorage, so the cookie must be set here before router.push() is called.
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict; max-age=${COOKIE_MAX_AGE}`;
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Expire the cookie immediately
  document.cookie = `${TOKEN_KEY}=; path=/; SameSite=Strict; max-age=0`;
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
