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

function jsonReq(path: string, method: string, body?: Record<string, unknown>) {
  return fetch(path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then(parse);
}

export const api = {
  me: () => fetch("/api/v2/me", { credentials: "include" }).then(parse),
  auth: () => fetch("/api/auth", { credentials: "include" }).then(parse),
  postAuth: (body: Record<string, unknown>) => jsonReq("/api/auth", "POST", body),
  patchOrg: (body: Record<string, unknown>) => jsonReq("/api/v2/organization", "PATCH", body),
  sites: () => fetch("/api/v2/sites", { credentials: "include" }).then(parse),
  createSite: (body: Record<string, unknown>) => jsonReq("/api/v2/sites", "POST", body),
  materials: () => fetch("/api/v2/materials", { credentials: "include" }).then(parse),
  analyses: () => fetch("/api/v2/ai/analyses", { credentials: "include" }).then(parse),
  drafts: () => fetch("/api/v2/ai/drafts", { credentials: "include" }).then(parse),
  createDraft: (body: Record<string, unknown> = {}) => jsonReq("/api/v2/ai/drafts", "POST", body),
  getDraft: (id: string) => fetch(`/api/v2/ai/drafts/${id}`, { credentials: "include" }).then(parse),
  patchDraft: (id: string, body: Record<string, unknown>) => jsonReq(`/api/v2/ai/drafts/${id}`, "PATCH", body),
  confirmDraft: (id: string, body: Record<string, unknown>) => jsonReq(`/api/v2/ai/drafts/${id}/confirm`, "POST", body),
  rejectDraft: (id: string) => jsonReq(`/api/v2/ai/drafts/${id}/reject`, "POST", {}),
};
