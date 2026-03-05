"use client";

import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function TermsPage() {
  return (
    <ParentShell title="用户协议" subtitle="星途家长端服务使用条款" activePath="/settings">
      <section className="proto-panel">
        <h2>用户协议</h2>
        <ul className="proto-bullets">
          <li>
            <strong>服务说明</strong>
            <p className="proto-muted">本产品提供训练建议与记录辅助，不替代线下医疗诊断。</p>
          </li>
          <li>
            <strong>账号责任</strong>
            <p className="proto-muted">请妥善保管登录凭证，不得共享给未授权人员。</p>
          </li>
          <li>
            <strong>使用规范</strong>
            <p className="proto-muted">禁止上传违法或侵害他人权益的信息。</p>
          </li>
        </ul>
        <Link href="/settings" className="button-link">
          返回设置
        </Link>
      </section>
    </ParentShell>
  );
}
