"use client";

import { callOrchestrator, type OrchestratorRole } from "@/lib/api/orchestrator-client";
import { readFrontendEnv } from "@/lib/env";
import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
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
  const runtime = useRoleRuntime(role);

  const messages = useChatStore((state) => state.messages);
  const pending = useChatStore((state) => state.pending);
  const setPending = useChatStore((state) => state.setPending);
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = async (message: string) => {
    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    });

    if (!runtime.accessToken) {
      addMessage(buildAssistantMessage("请先到 /auth 登录或配置访问令牌。"));
      return;
    }

    if (!runtime.selectedChildId) {
      addMessage(buildAssistantMessage("请先选择孩子后再发起对话。"));
      return;
    }

    try {
      setPending(true);
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

      addMessage(buildAssistantMessage(text));
    } catch (error) {
      addMessage(
        buildAssistantMessage(
          error instanceof Error ? `请求失败：${error.message}` : "请求失败，请稍后重试。",
        ),
      );
    } finally {
      setPending(false);
    }
  };

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
      <ChatFlow messages={messages} pending={pending} onSend={handleSend} />
    </main>
  );
}
