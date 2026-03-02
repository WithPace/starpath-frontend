import { create } from "zustand";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: ChatMessage[];
  pending: boolean;
  setPending: (pending: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "welcome-1",
      role: "assistant",
      content: "欢迎使用星途家长端，输入内容即可开始对话。",
    },
  ],
  pending: false,
  setPending: (pending) => set({ pending }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clear: () =>
    set({
      messages: [],
      pending: false,
    }),
}));
