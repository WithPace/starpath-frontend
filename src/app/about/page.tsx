"use client";

import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function AboutPage() {
  return (
    <ParentShell title="关于星途" subtitle="家庭干预协作平台" activePath="/settings">
      <section className="proto-panel">
        <h2>产品信息</h2>
        <ul className="proto-bullets">
          <li>
            <strong>产品愿景</strong>
            <p className="proto-muted">帮助家庭、老师、医生与机构形成同频协作闭环。</p>
          </li>
          <li>
            <strong>核心能力</strong>
            <p className="proto-muted">评估、训练、看板、协作对话、治理门禁。</p>
          </li>
          <li>
            <strong>当前版本</strong>
            <p className="proto-muted">StarPath Frontend MVP 2026.03</p>
          </li>
        </ul>
        <Link href="/settings" className="button-link">
          返回设置
        </Link>
      </section>
    </ParentShell>
  );
}
