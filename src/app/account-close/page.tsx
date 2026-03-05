"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function AccountClosePage() {
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!confirmed) {
      setMessage("请先勾选确认项。");
      return;
    }

    setMessage("注销申请已提交，我们将在 1-3 个工作日内联系确认。");
  };

  return (
    <ParentShell title="注销账号" subtitle="提交账号注销申请" activePath="/settings">
      <section className="proto-panel">
        <h2>注销说明</h2>
        <ul className="proto-bullets">
          <li>注销后将无法登录当前账号。</li>
          <li>历史训练与评估数据不可恢复。</li>
          <li>正在执行的服务将同步终止。</li>
        </ul>

        <form className="proto-form" onSubmit={submit}>
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            我已知晓注销后将无法恢复历史数据
          </label>
          <div className="module-chain-actions">
            <button type="submit" className="button-primary">
              提交注销申请
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
