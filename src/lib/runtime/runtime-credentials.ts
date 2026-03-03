export const RUNTIME_ACCESS_TOKEN_KEY = "sp_access_token";
export const RUNTIME_CHILD_ID_KEY = "sp_child_id";

function normalizeValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function readStorageValue(storage: Storage, key: string): string | null {
  try {
    return normalizeValue(storage.getItem(key));
  } catch {
    return null;
  }
}

export function normalizeManualChildId(value: string | null | undefined): string | null {
  const normalized = normalizeValue(value);
  if (!normalized) return null;
  if (normalized === "placeholder-child-id") return null;
  return normalized;
}

export function normalizeManualAccessToken(value: string | null | undefined): string | null {
  const normalized = normalizeValue(value);
  if (!normalized) return null;
  if (normalized === "placeholder-token") return null;
  return normalized;
}

export function readManualRuntimeCredentials(storage: Storage): {
  manualAccessToken: string | null;
  manualChildId: string | null;
} {
  return {
    manualAccessToken: normalizeManualAccessToken(readStorageValue(storage, RUNTIME_ACCESS_TOKEN_KEY)),
    manualChildId: normalizeManualChildId(readStorageValue(storage, RUNTIME_CHILD_ID_KEY)),
  };
}

export function readManualRuntimeCredentialsFromWindow(): {
  manualAccessToken: string | null;
  manualChildId: string | null;
} {
  if (typeof window === "undefined") {
    return {
      manualAccessToken: null,
      manualChildId: null,
    };
  }

  return readManualRuntimeCredentials(window.localStorage);
}

export function persistManualRuntimeCredentials(
  storage: Storage,
  input: { manualAccessToken?: string | null; manualChildId?: string | null },
): void {
  const token = normalizeManualAccessToken(input.manualAccessToken);
  const childId = normalizeManualChildId(input.manualChildId);

  if (token) {
    storage.setItem(RUNTIME_ACCESS_TOKEN_KEY, token);
  } else {
    storage.removeItem(RUNTIME_ACCESS_TOKEN_KEY);
  }

  if (childId) {
    storage.setItem(RUNTIME_CHILD_ID_KEY, childId);
  } else {
    storage.removeItem(RUNTIME_CHILD_ID_KEY);
  }
}

export function persistManualChildId(childId: string | null): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeManualChildId(childId);
  if (normalized) {
    window.localStorage.setItem(RUNTIME_CHILD_ID_KEY, normalized);
  } else {
    window.localStorage.removeItem(RUNTIME_CHILD_ID_KEY);
  }
}

export function clearManualRuntimeCredentials(storage: Storage): void {
  storage.removeItem(RUNTIME_ACCESS_TOKEN_KEY);
  storage.removeItem(RUNTIME_CHILD_ID_KEY);
}
