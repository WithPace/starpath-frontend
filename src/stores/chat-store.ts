import { create } from "zustand";

import type { OrchestratorRole } from "@/lib/api/orchestrator-client";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type RoleChatState = {
  messages: ChatMessage[];
  pending: boolean;
};

type ChatState = {
  sessions: Record<OrchestratorRole, RoleChatState>;
  getMessages: (role: OrchestratorRole) => ChatMessage[];
  isPending: (role: OrchestratorRole) => boolean;
  setPending: (role: OrchestratorRole, pending: boolean) => void;
  addMessage: (role: OrchestratorRole, message: ChatMessage) => void;
  clear: (role: OrchestratorRole) => void;
};

const DEFAULT_WELCOME: Record<OrchestratorRole, string> = {
  parent: "欢迎使用星途家长端，输入内容即可开始对话。",
  doctor: "欢迎进入医生协作面板，可直接追问孩子近期变化。",
  teacher: "欢迎进入特教老师协作面板，可同步训练反馈和课堂观察。",
  org_admin: "欢迎进入机构管理端，先在成员管理确认权限后再进入分析流程。",
};

function createSession(role: OrchestratorRole): RoleChatState {
  return {
    messages: [
      {
        id: `welcome-${role}`,
        role: "assistant",
        content: DEFAULT_WELCOME[role],
      },
    ],
    pending: false,
  };
}

function updateSession(
  sessions: Record<OrchestratorRole, RoleChatState>,
  role: OrchestratorRole,
  updater: (session: RoleChatState) => RoleChatState,
): Record<OrchestratorRole, RoleChatState> {
  return {
    ...sessions,
    [role]: updater(sessions[role]),
  };
}

const initialSessions: Record<OrchestratorRole, RoleChatState> = {
  parent: createSession("parent"),
  doctor: createSession("doctor"),
  teacher: createSession("teacher"),
  org_admin: createSession("org_admin"),
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: initialSessions,
  getMessages: (role) => get().sessions[role].messages,
  isPending: (role) => get().sessions[role].pending,
  setPending: (role, pending) =>
    set((state) => ({
      sessions: updateSession(state.sessions, role, (session) => ({
        ...session,
        pending,
      })),
    })),
  addMessage: (role, message) =>
    set((state) => ({
      sessions: updateSession(state.sessions, role, (session) => ({
        ...session,
        messages: [...session.messages, message],
      })),
    })),
  clear: (role) =>
    set((state) => ({
      sessions: updateSession(state.sessions, role, () => createSession(role)),
    })),
}));
