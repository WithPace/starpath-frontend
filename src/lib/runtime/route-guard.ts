export type RouteGuardInput = {
  loading: boolean;
  accessToken: string | null;
  currentPath?: string;
};

export type RouteGuardDecision = {
  allow: boolean;
  redirectTo: string | null;
  reason: "loading" | "auth_required" | "ok";
};

function encodeNextPath(path: string | undefined): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getRouteGuardDecision(input: RouteGuardInput): RouteGuardDecision {
  if (input.loading) {
    return {
      allow: false,
      redirectTo: null,
      reason: "loading",
    };
  }

  if (!input.accessToken) {
    const nextPath = encodeURIComponent(encodeNextPath(input.currentPath));
    return {
      allow: false,
      redirectTo: `/auth?next=${nextPath}`,
      reason: "auth_required",
    };
  }

  return {
    allow: true,
    redirectTo: null,
    reason: "ok",
  };
}
