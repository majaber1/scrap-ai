export type Me = {
  user: { id: string; email: string; fullName: string };
  organization: { id: string; name: string; customerSegment: string; legacyKind: string };
  navigation: string[];
  individualUx: boolean;
  needsOnboarding: boolean;
  permissions: string[];
  roles: string[];
};

async function parse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "request_failed");
  return data;
}

export const api = {
  me: () => fetch("/api/v2/me", { credentials: "include" }).then(parse),
  auth: () => fetch("/api/auth", { credentials: "include" }).then(parse),
  postAuth: (body: Record<string, unknown>) =>
    fetch("/api/auth", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(parse),
  patchOrg: (body: Record<string, unknown>) =>
    fetch("/api/v2/organization", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(parse),
  sites: () => fetch("/api/v2/sites", { credentials: "include" }).then(parse),
  createSite: (body: Record<string, unknown>) =>
    fetch("/api/v2/sites", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(parse),
};
