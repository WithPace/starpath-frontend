"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { callOrchestrator, type OrchestratorRole } from "@/lib/api/orchestrator-client";
import { DashboardCards } from "@/components/cards/dashboard-cards";
import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
import { readFrontendEnv } from "@/lib/env";
import { extractDashboardCards } from "@/lib/runtime/dashboard-cards";
import { isPermissionDeniedMessage } from "@/lib/runtime/org-members";
import { reportRuntimeError } from "@/lib/runtime/runtime-telemetry";
import { useProtectedRoute } from "@/lib/runtime/use-protected-route";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { useDashboardStore } from "@/stores/dashboard-store";

type RoleDashboardPageProps = {
  title: string;
  role: OrchestratorRole;
  roleLabel: string;
};

export function RoleDashboardPage({ title, role, roleLabel }: RoleDashboardPageProps) {
  const router = useRouter();
  const runtime = useRoleRuntime(role);
  const routeDecision = useProtectedRoute(runtime.accessToken, runtime.loading);

  const cards = useDashboardStore((state) => state.cards);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const setCards = useDashboardStore((state) => state.setCards);
  const setLoading = useDashboardStore((state) => state.setLoading);
  const setError = useDashboardStore((state) => state.setError);

  useEffect(() => {
    if (!routeDecision.allow) {
      setCards([]);
      setLoading(false);
      setError(null);
      return;
    }

    const accessToken = runtime.accessToken;
    const childId = runtime.selectedChildId;

    if (!runtime.isAuthenticated || !childId || !accessToken) {
      setCards([]);
      setLoading(false);
      setError("请先完成登录并选择孩子，再加载看板。");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const env = readFrontendEnv();
        const events = await callOrchestrator(
          {
            apiBaseUrl: env.apiBaseUrl,
            accessToken,
          },
          {
            child_id: childId,
            message: "请生成当前角色的看板数据",
            module: "dashboard",
            role,
            request_id: crypto.randomUUID(),
          },
        );

        const nextCards = extractDashboardCards(events);
        if (nextCards.length === 0) {
          setError("看板请求成功，但未返回 cards 数据。请检查后端 done/delta payload。");
          setCards([]);
          return;
        }

        setCards(nextCards);
      } catch (requestError) {
        const errorMessage = requestError instanceof Error ? requestError.message : "看板加载失败";
        reportRuntimeError({
          scope: "role_dashboard",
          message: errorMessage,
          context: { role, route: "dashboard" },
        });

        if (isPermissionDeniedMessage(errorMessage)) {
          router.replace(`/forbidden?reason=permission_denied&role=${role}`);
        }

        setError(errorMessage);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [
    role,
    routeDecision.allow,
    router,
    runtime.accessToken,
    runtime.isAuthenticated,
    runtime.selectedChildId,
    setCards,
    setError,
    setLoading,
  ]);

  if (!routeDecision.allow) {
    return (
      <main>
        <h1>{title}</h1>
        <p>正在跳转到认证页面...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{title}</h1>
      <RoleRuntimePanel
        roleLabel={roleLabel}
        loading={runtime.loading}
        warning={runtime.warning}
        isAuthenticated={runtime.isAuthenticated}
        sessionEmail={runtime.sessionEmail}
        childOptions={runtime.children}
        selectedChildId={runtime.selectedChildId}
        onSelectChild={runtime.setSelectedChildId}
        onRefresh={runtime.refresh}
        onSignOut={runtime.signOut}
      />
      <DashboardCards cards={cards} loading={loading} error={error} />
    </main>
  );
}
