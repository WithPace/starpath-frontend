"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function FeedbackPage() {
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      setMessage("反馈内容不能为空。");
      return;
    }

    setMessage("反馈已记录（本地确认），后台接入将在下一阶段完成。");
    setContent("");
    setContact("");
  };

  return (
    <ParentShell title="意见反馈" subtitle="告诉我们你希望优先改进的体验" activePath="/settings">
      <section className="proto-panel">
        <h2>反馈通道</h2>
        <form className="proto-form" onSubmit={submit}>
          <label>
            反馈内容
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="请描述你遇到的问题或建议..."
            />
          </label>
          <label>
            联系方式（可选）
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="手机号或邮箱"
            />
          </label>
          <div className="module-chain-actions">
            <button type="submit" className="button-primary">
              提交反馈
            </button>
            <Link href="/settings" className="button-link">
              返回设置
            </Link>
          </div>
        </form>
        {message ? <p className="proto-muted">{message}</p> : null}
      </section>
    </ParentShell>
  );
}
