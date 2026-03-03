type TokenInput = {
  sessionAccessToken?: string | null;
  manualAccessToken?: string | null;
};

type ChildRow = {
  id: string;
  nickname: string | null;
  real_name: string | null;
};

export type ChildOption = {
  id: string;
  label: string;
};

function normalizeToken(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed === "placeholder-token") return null;
  return trimmed;
}

export function pickRuntimeAccessToken({
  sessionAccessToken,
  manualAccessToken,
}: TokenInput): string | null {
  return normalizeToken(sessionAccessToken) ?? normalizeToken(manualAccessToken);
}

export function buildChildOptions(children: ChildRow[]): ChildOption[] {
  return children.map((child) => ({
    id: child.id,
    label: child.nickname ?? child.real_name ?? child.id,
  }));
}

export function resolveSelectedChildId(
  options: ChildOption[],
  preferredChildId?: string | null,
): string | null {
  if (options.length === 0) return null;

  const preferred = preferredChildId?.trim();
  if (preferred && options.some((option) => option.id === preferred)) {
    return preferred;
  }

  return options[0].id;
}

