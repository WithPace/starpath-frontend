"use client";

import { FormEvent, useState } from "react";

import type { ChatMessage } from "@/stores/chat-store";

type ChatFlowProps = {
  messages: ChatMessage[];
  pending: boolean;
  onSend: (message: string) => void;
};

export function ChatFlow({ messages, pending, onSend }: ChatFlowProps) {
  const [value, setValue] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) return;
    onSend(next);
    setValue("");
  };

  return (
    <section aria-label="chat-flow">
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.role === "assistant" ? "AI" : "我"}：</strong>
            <span>{message.content}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <input
          aria-label="chat-input"
          placeholder="输入你的问题..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={pending}
        />
        <button type="submit" disabled={pending}>
          发送
        </button>
      </form>
    </section>
  );
}
