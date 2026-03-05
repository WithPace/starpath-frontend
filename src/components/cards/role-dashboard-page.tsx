"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { callOrchestrator, type OrchestratorRole } from "@/lib/api/orchestrator-client";
import { DashboardCards } from "@/components/cards/dashboard-cards";
import { RoleBusinessPanel } from "@/components/cards/role-business-panel";
import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
import { readFrontendEnv } from "@/lib/env";
import { extractDashboardCards } from "@/lib/runtime/dashboard-cards";
import { getRoleUiMeta } from "@/lib/runtime/role-ui";
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
  const routeDecision = useProtectedRoute(
    runtime.accessToken,
    runtime.loading,
    Boolean(runtime.selectedChildId),
  );
  const roleUi = getRoleUiMeta(role);

  const cards = useDashboardStore((state) => state.getCards(role));
  const loading = useDashboardStore((state) => state.isLoading(role));
  const error = useDashboardStore((state) => state.getError(role));
  const setCards = useDashboardStore((state) => state.setCards);
  const setLoading = useDashboardStore((state) => state.setLoading);
  const setError = useDashboardStore((state) => state.setError);

  useEffect(() => {
    if (!routeDecision.allow) {
      setCards(role, []);
      setLoading(role, false);
      setError(role, null);
      return;
    }

    const accessToken = runtime.accessToken;
    const childId = runtime.selectedChildId;

    if (!runtime.isAuthenticated || !childId || !accessToken) {
      setCards(role, []);
      setLoading(role, false);
      setError(role, "请先完成登录并选择孩子，再加载看板。");
      return;
    }

    const run = async () => {
      try {
        setLoading(role, true);
        setError(role, null);

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
          setError(role, "看板请求成功，但未返回 cards 数据。请检查后端 done/delta payload。");
          setCards(role, []);
          return;
        }

        setCards(role, nextCards);
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

        setError(role, errorMessage);
        setCards(role, []);
      } finally {
        setLoading(role, false);
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
      <main className={`app-shell ${roleUi.themeClass}`}>
        <section className="surface-card">
          <h1 className="page-title">{title}</h1>
          <p className="muted-text">正在跳转到认证页面...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${roleUi.themeClass}`}>
      <section className="surface-card">
        <header className="role-header">
          <div>
            <p className="role-kicker">{roleLabel}</p>
            <h1 className="page-title">{title}</h1>
          </div>
          <nav className="role-nav" aria-label={`${roleLabel}-routes`}>
            <Link href={roleUi.chatPath}>对话</Link>
            <Link href={roleUi.dashboardPath} className="active">
              看板
            </Link>
            {roleUi.journeyPath ? <Link href={roleUi.journeyPath}>业务链路</Link> : null}
            {roleUi.membersPath ? <Link href={roleUi.membersPath}>成员管理</Link> : null}
            <Link href="/auth">认证</Link>
          </nav>
        </header>
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
        <RoleBusinessPanel role={role} cards={cards} loading={loading} error={error} />
      </section>
    </main>
  );
}
