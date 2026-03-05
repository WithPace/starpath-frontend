"use client";

import { FormEvent, useState } from "react";

import type { ChatMessage } from "@/stores/chat-store";

type ChatFlowProps = {
  messages: ChatMessage[];
  pending: boolean;
  onSend: (message: string) => void;
  roleLabel?: string;
  quickPrompts?: string[];
};

const defaultQuickPrompts = [
  "今天训练怎么安排？",
  "帮我总结最近风险变化",
  "给我一个可执行的家庭练习",
];

export function ChatFlow({ messages, pending, onSend, roleLabel, quickPrompts }: ChatFlowProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const promptList = quickPrompts && quickPrompts.length > 0 ? quickPrompts : defaultQuickPrompts;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) return;
    onSend(next);
    setValue("");
  };

  return (
    <section aria-label="chat-flow" className="chat-flow">
      <header className="chat-flow__header">
        <h2>{roleLabel ? `${roleLabel}对话` : "角色对话"}</h2>
        <p>基于执行链路实时生成建议，支持持续追问。</p>
      </header>
      <ul className="chat-flow__timeline">
        {messages.map((message) => (
          <li key={message.id} className={`chat-message ${message.role === "assistant" ? "assistant" : "user"}`}>
            <p className="chat-message__tag">{message.role === "assistant" ? "AI 助手" : "你"}</p>
            <p>{message.content}</p>
          </li>
        ))}
        {pending ? (
          <li className="chat-message assistant" aria-live="polite">
            <p className="chat-message__tag">AI 助手</p>
            <p>正在生成回复...</p>
          </li>
        ) : null}
      </ul>
      <div className="chat-flow__quick-actions" aria-label="quick-prompts">
        {promptList.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="chip-button"
            onClick={() => onSend(prompt)}
            disabled={pending}
          >
            {prompt}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="chat-flow__composer">
        <div className={focused ? "chat-flow__input-shell focused" : "chat-flow__input-shell"}>
          <div className="chat-flow__input-top">
            <button type="button" aria-label="语音输入" className="chip-button">🎤</button>
            <input
              aria-label="chat-input"
              placeholder="输入你的问题..."
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={pending}
            />
            <button type="button" aria-label="添加媒体" className="chip-button">＋</button>
          </div>
          <div className="chat-flow__input-bottom">
            <button type="button" className="button-link">乐乐 ⇄</button>
            <button type="button" aria-label="查看档案" className="button-link">查看档案 ›</button>
          </div>
        </div>
        <button type="submit" disabled={pending} className="button-primary">
          发送
        </button>
      </form>
    </section>
  );
}
