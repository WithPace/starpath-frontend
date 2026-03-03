export function resolveAuthNextPath(nextPath: string | null | undefined): string {
  const normalized = (nextPath ?? "").trim();
  if (!normalized) return "/";
  if (!normalized.startsWith("/")) return "/";
  if (normalized.startsWith("//")) return "/";
  return normalized;
}
