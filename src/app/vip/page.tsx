"use client";

import Link from "next/link";
import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function VipPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <ParentShell title="升级 VIP" subtitle="解锁更完整的家庭训练协作能力" activePath="/settings">
      <section className="proto-panel">
        <h2>VIP 权益</h2>
        <ul className="proto-bullets">
          <li>更多 AI 高级分析额度</li>
          <li>训练周报深度对比</li>
          <li>多角色协作优先支持</li>
        </ul>
        <div className="module-chain-actions">
          <button type="button" className="button-primary" onClick={() => setMessage("升级申请已记录，我们会尽快联系你。")}>
            立即升级
          </button>
          <Link href="/settings" className="button-link">
            返回设置
          </Link>
        </div>
        {message ? <p className="proto-muted">{message}</p> : null}
      </section>
    </ParentShell>
  );
}
