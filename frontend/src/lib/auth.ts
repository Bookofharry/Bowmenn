import Cookies from "js-cookie";
import { User, Role } from "@/types";

const ACCESS_TOKEN_KEY = "bowmenn_access_token";
const USER_KEY = "bowmenn_user";
const ROLE_COOKIE = "bowmenn_role";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  Cookies.remove(ROLE_COOKIE);
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Set a cookie for Next.js middleware route protection
  Cookies.set(ROLE_COOKIE, user.role, { expires: 30 });
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getRoleDashboard(role: Role): string {
  switch (role) {
    case Role.CUSTOMER:
      return "/customer/dashboard";
    case Role.DRIVER:
      return "/driver/dashboard";
    case Role.ADMIN:
      return "/admin/dashboard";
    default:
      return "/login";
  }
}
