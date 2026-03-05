"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ParentShell } from "@/components/prototype/parent-shell";

function normalizeNextPath(value: string | null): string {
  if (!value) return "/chat";
  return value.startsWith("/") ? value : `/${value}`;
}

export default function SessionExpiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => normalizeNextPath(searchParams.get("next")), [searchParams]);

  const backToAuth = () => {
    router.replace(`/auth?next=${encodeURIComponent(nextPath)}`);
  };

  return (
    <ParentShell title="认证异常" subtitle="会话状态已失效，需要重新认证" activePath="/settings" hideBottomNav>
      <section className="proto-panel proto-center">
        <p className="proto-kicker">Session Recovery</p>
        <h2>会话已过期</h2>
        <p className="proto-muted">为保护数据安全，请重新登录后继续访问页面。</p>
        <div className="proto-actions">
          <button type="button" className="button-primary" onClick={backToAuth}>
            重新登录
          </button>
          <button type="button" className="button-secondary" onClick={() => router.replace("/welcome")}>
            返回首页
          </button>
        </div>
      </section>
    </ParentShell>
  );
}
