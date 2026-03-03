export type InviteInput = {
  orgId: string;
  userId: string;
  orgRole: string;
};

export type InvitePayload = {
  org_id: string;
  user_id: string;
  org_role: string;
  status: "active";
};

function normalizeRequired(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} is required`);
  }
  return trimmed;
}

export function buildInvitePayload(input: InviteInput): InvitePayload {
  return {
    org_id: normalizeRequired(input.orgId, "orgId"),
    user_id: normalizeRequired(input.userId, "userId"),
    org_role: normalizeRequired(input.orgRole, "orgRole"),
    status: "active",
  };
}

export type StatusPatch = {
  status: "active" | "inactive";
};

export function normalizeStatusPatch(nextStatus: string): StatusPatch {
  const normalized = nextStatus.trim().toLowerCase();
  if (normalized !== "active" && normalized !== "inactive") {
    throw new Error("invalid status");
  }

  return { status: normalized } as StatusPatch;
}

export function isPermissionDeniedMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("permission") || normalized.includes("forbidden") || normalized.includes("42501");
}
