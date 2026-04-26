import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

const ROOT = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
export const apiBase = `${ROOT}/api`;

if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL as string);
} else {
  setBaseUrl("");
}

// Inject Clerk token into every API request
async function getClerkToken(): Promise<string | null> {
  try {
    const { Clerk } = window as any;
    if (!Clerk) return null;
    const token = await Clerk.session?.getToken();
    return token ?? null;
  } catch {
    return null;
  }
}

setAuthTokenGetter(getClerkToken);

export function appPath(path: string): string {
  if (path === "/") return ROOT === "" ? "/" : ROOT;
  if (path.startsWith("/")) return `${ROOT}${path}`;
  return `${ROOT}/${path}`;
}
