"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getRouteGuardDecision } from "./route-guard";

export function useProtectedRoute(
  accessToken: string | null,
  loading: boolean,
  hasActiveChild?: boolean,
) {
  const router = useRouter();
  const pathname = usePathname();

  const decision = useMemo(
    () =>
      getRouteGuardDecision({
        loading,
        accessToken,
        hasActiveChild,
        currentPath: pathname ?? "/",
      }),
    [loading, accessToken, hasActiveChild, pathname],
  );

  useEffect(() => {
    if (decision.redirectTo) {
      router.replace(decision.redirectTo);
    }
  }, [decision.redirectTo, router]);

  return decision;
}
