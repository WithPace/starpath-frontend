export type RouteGuardInput = {
  loading: boolean;
  accessToken: string | null;
  hasActiveChild?: boolean;
  currentPath?: string;
};

export type RouteGuardDecision = {
  allow: boolean;
  redirectTo: string | null;
  reason: "loading" | "auth_required" | "child_required" | "ok";
};

function encodeNextPath(path: string | undefined): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function requiresParentChild(path: string): boolean {
  const childRequiredRoutes = [
    "/chat",
    "/dashboard",
    "/journey",
    "/assessment",
    "/training-advice",
    "/voice-record",
    "/home-guide",
    "/card-fullscreen",
    "/training-weekly",
    "/analysis-report",
    "/training-detail",
  ];

  return childRequiredRoutes.includes(path);
}

export function getRouteGuardDecision(input: RouteGuardInput): RouteGuardDecision {
  const currentPath = encodeNextPath(input.currentPath);

  if (input.loading) {
    return {
      allow: false,
      redirectTo: null,
      reason: "loading",
    };
  }

  if (!input.accessToken) {
    const nextPath = encodeURIComponent(currentPath);
    return {
      allow: false,
      redirectTo: `/auth?next=${nextPath}`,
      reason: "auth_required",
    };
  }

  if (input.hasActiveChild === false && requiresParentChild(currentPath)) {
    const nextPath = encodeURIComponent(currentPath);
    return {
      allow: false,
      redirectTo: `/create-child?next=${nextPath}`,
      reason: "child_required",
    };
  }

  return {
    allow: true,
    redirectTo: null,
    reason: "ok",
  };
}
