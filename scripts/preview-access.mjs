import { readFileSync, existsSync } from "node:fs";

export function loadShareToken() {
  if (process.env.VERCEL_SHARE) return process.env.VERCEL_SHARE.trim();
  const file = process.env.VERCEL_SHARE_FILE || "";
  if (file && existsSync(file)) return readFileSync(file, "utf8").trim();
  return "";
}

function cookieHeader(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie().map((row) => row.split(";")[0]).filter(Boolean).join("; ");
  }
  const raw = response.headers.get("set-cookie");
  return raw ? raw.split(";")[0] : "";
}

let cached = "";

export async function previewCookie(base) {
  const share = loadShareToken();
  if (!share) return "";
  if (cached) return cached;
  const response = await fetch(`${base.replace(/\/$/, "")}/api/health?_vercel_share=${encodeURIComponent(share)}`, {
    redirect: "manual",
    headers: { "User-Agent": "ScrapAI-PreviewAccess/1.0" },
  });
  cached = cookieHeader(response);
  return cached;
}

export function joinCookies(...parts) {
  return parts.filter(Boolean).join("; ");
}
