import { setBaseUrl } from "@workspace/api-client-react";

const ROOT = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

export const apiBase = `${ROOT}/api`;

setBaseUrl("");

export function appPath(path: string): string {
  if (path === "/") return ROOT === "" ? "/" : ROOT;
  if (path.startsWith("/")) return `${ROOT}${path}`;
  return `${ROOT}/${path}`;
}
