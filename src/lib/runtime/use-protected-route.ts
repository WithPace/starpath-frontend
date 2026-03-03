"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getRouteGuardDecision } from "./route-guard";

export function useProtectedRoute(accessToken: string | null, loading: boolean) {
  const router = useRouter();
  const pathname = usePathname();

  const decision = useMemo(
    () =>
      getRouteGuardDecision({
        loading,
        accessToken,
        currentPath: pathname ?? "/",
      }),
    [loading, accessToken, pathname],
  );

  useEffect(() => {
    if (decision.redirectTo) {
      router.replace(decision.redirectTo);
    }
  }, [decision.redirectTo, router]);

  return decision;
}
