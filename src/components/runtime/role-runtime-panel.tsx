"use client";

import Link from "next/link";

import type { ChildOption } from "@/lib/runtime/role-runtime";

type RoleRuntimePanelProps = {
  roleLabel: string;
  loading: boolean;
  warning: string | null;
  isAuthenticated: boolean;
  sessionEmail: string | null;
  childOptions: ChildOption[];
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
  onRefresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function RoleRuntimePanel({
  roleLabel,
  loading,
  warning,
  isAuthenticated,
  sessionEmail,
  childOptions,
  selectedChildId,
  onSelectChild,
  onRefresh,
  onSignOut,
}: RoleRuntimePanelProps) {
  return (
    <section aria-label="runtime-context" className="runtime-panel">
      <div className="runtime-panel__meta">
        <p className="runtime-panel__role">角色：{roleLabel}</p>
        <p className="runtime-panel__status">
          登录状态：{isAuthenticated ? `已登录 (${sessionEmail ?? "未知账号"})` : "未登录"}
        </p>
      </div>
      {childOptions.length > 0 ? (
        <label className="runtime-panel__selector">
          当前孩子
          <select
            value={selectedChildId ?? ""}
            onChange={(event) => onSelectChild(event.target.value)}
          >
            {childOptions.map((child) => (
              <option key={child.id} value={child.id}>
                {child.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="runtime-panel__hint">暂无可选孩子，请先在 /auth 配置或确认 care_teams 数据。</p>
      )}
      {warning ? <p className="runtime-panel__warning">{warning}</p> : null}
      {loading ? <p className="runtime-panel__hint">运行时上下文加载中...</p> : null}
      <div className="runtime-panel__actions">
        <Link href="/auth" className="button-link">
          前往认证配置
        </Link>
        <button type="button" onClick={() => void onRefresh()} className="button-secondary">
          刷新上下文
        </button>
        {isAuthenticated ? (
          <button type="button" onClick={() => void onSignOut()} className="button-secondary">
            退出登录
          </button>
        ) : null}
      </div>
    </section>
  );
}
