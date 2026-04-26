import { appPath } from "./api";

export function loginUrl(returnTo?: string): string {
  const target = returnTo ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  const params = new URLSearchParams({ returnTo: target });
  return `/api/login?${params.toString()}`;
}

export function logoutUrl(): string {
  return `/api/logout`;
}
