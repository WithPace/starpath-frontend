"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { callOrchestrator, type OrchestratorRole } from "@/lib/api/orchestrator-client";
import { readFrontendEnv } from "@/lib/env";
import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
import { getRoleUiMeta } from "@/lib/runtime/role-ui";
import { isPermissionDeniedMessage } from "@/lib/runtime/org-members";
import { reportRuntimeError } from "@/lib/runtime/runtime-telemetry";
import { useProtectedRoute } from "@/lib/runtime/use-protected-route";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { ChatFlow } from "@/components/chat/chat-flow";
import { useChatStore } from "@/stores/chat-store";

type RoleChatPageProps = {
  title: string;
  role: OrchestratorRole;
  roleLabel: string;
};

function buildAssistantMessage(content: string) {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
    content,
  };
}

export function RoleChatPage({ title, role, roleLabel }: RoleChatPageProps) {
  const router = useRouter();
  const runtime = useRoleRuntime(role);
  const routeDecision = useProtectedRoute(runtime.accessToken, runtime.loading);
  const roleUi = getRoleUiMeta(role);

  const messages = useChatStore((state) => state.getMessages(role));
  const pending = useChatStore((state) => state.isPending(role));
  const setPending = useChatStore((state) => state.setPending);
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!routeDecision.allow) return;
    if (!runtime.isAuthenticated) return;
    if (runtime.selectedChildId) return;

    router.replace(`/forbidden?reason=no_child_access&role=${role}`);
  }, [routeDecision.allow, role, router, runtime.isAuthenticated, runtime.selectedChildId]);

  const handleSend = async (message: string) => {
    addMessage(role, {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    });

    if (!runtime.accessToken) {
      addMessage(role, buildAssistantMessage("请先完成认证，再发起对话。"));
      return;
    }

    if (!runtime.selectedChildId) {
      addMessage(role, buildAssistantMessage("请先选择孩子后再发起对话。"));
      return;
    }

    try {
      setPending(role, true);
      const env = readFrontendEnv();

      const events = await callOrchestrator(
        {
          apiBaseUrl: env.apiBaseUrl,
          accessToken: runtime.accessToken,
        },
        {
          child_id: runtime.selectedChildId,
          message,
          module: "chat_casual",
          role,
          request_id: crypto.randomUUID(),
        },
      );

      const deltaEvents = events.filter((event) => event.event === "delta");
      const latestDelta = deltaEvents[deltaEvents.length - 1];
      const text = typeof latestDelta?.data.text === "string"
        ? latestDelta.data.text
        : "已收到请求，但无可展示内容。";

      addMessage(role, buildAssistantMessage(text));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "请求失败，请稍后重试。";
      reportRuntimeError({
        scope: "role_chat",
        message: errorMessage,
        context: { role, route: "chat" },
      });

      if (isPermissionDeniedMessage(errorMessage)) {
        router.replace(`/forbidden?reason=permission_denied&role=${role}`);
        return;
      }

      addMessage(
        role,
        buildAssistantMessage(
          error instanceof Error ? `请求失败：${error.message}` : "请求失败，请稍后重试。",
        ),
      );
    } finally {
      setPending(role, false);
    }
  };

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
            <Link href={roleUi.chatPath} className="active">
              对话
            </Link>
            <Link href={roleUi.dashboardPath}>看板</Link>
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
        <ChatFlow messages={messages} pending={pending} onSend={handleSend} roleLabel={roleLabel} />
      </section>
    </main>
  );
}
