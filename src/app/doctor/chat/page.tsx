"use client";

import { callOrchestrator } from "@/lib/api/orchestrator-client";
import { readFrontendEnv } from "@/lib/env";
import { ChatFlow } from "@/components/chat/chat-flow";
import { useChatStore } from "@/stores/chat-store";

export default function DoctorChatPage() {
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

    try {
      setPending(true);
      const env = readFrontendEnv();
      const accessToken = localStorage.getItem("sp_access_token") ?? "placeholder-token";

      const events = await callOrchestrator(
        {
          apiBaseUrl: env.apiBaseUrl,
          accessToken,
        },
        {
          child_id: "placeholder-child-id",
          message,
          module: "chat_casual",
          role: "doctor",
          request_id: crypto.randomUUID(),
        },
      );

      const delta = events.find((event) => event.event === "delta");
      const text = typeof delta?.data.text === "string"
        ? delta.data.text
        : "已收到请求，但无可展示内容。";

      addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: text,
      });
    } catch (error) {
      addMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: error instanceof Error ? `请求失败：${error.message}` : "请求失败，请稍后重试。",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <main>
      <h1>医生端对话</h1>
      <ChatFlow messages={messages} pending={pending} onSend={handleSend} />
    </main>
  );
}
