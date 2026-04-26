import { useClerk } from "@clerk/clerk-react";

export function loginUrl(returnTo?: string): string {
  const target = returnTo ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  return `/login?returnTo=${encodeURIComponent(target)}`;
}

export function logoutUrl(): string {
  return "/";
}

export function useLogout() {
  const { signOut } = useClerk();
  return () => signOut({ redirectUrl: "/" });
}
