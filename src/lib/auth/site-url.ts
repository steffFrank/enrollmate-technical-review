import "server-only";
import { headers } from "next/headers";

type HeaderSource = {
  get(name: string): string | null;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isLocalhostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export async function getAuthSiteUrl(sourceHeaders?: HeaderSource): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && !isLocalhostUrl(configured)) return trimTrailingSlash(configured);

  let h = sourceHeaders;
  if (!h) {
    try {
      h = await headers();
    } catch {
      return trimTrailingSlash(configured || "http://localhost:3000");
    }
  }

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  return trimTrailingSlash(configured || "http://localhost:3000");
}
