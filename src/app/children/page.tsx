"use client";

import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";

export default function ChildrenPage() {
  const runtime = useRoleRuntime("parent");

  const authHref = "/auth?next=%2Fchildren";

  return (
    <ParentShell title="孩子管理" subtitle="管理多个孩子档案与当前工作对象" activePath="/quick-menu">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>孩子管理</h2>
          <Link href="/create-child" className="button-primary">
            新建孩子档案
          </Link>
        </div>
        {runtime.loading ? <p className="proto-muted">孩子列表加载中...</p> : null}
        {!runtime.loading && !runtime.accessToken ? (
          <>
            <p className="proto-muted">当前未登录，请先完成认证后再管理孩子档案。</p>
            <Link href={authHref} className="button-secondary">
              前往登录
            </Link>
          </>
        ) : null}
        {!runtime.loading && runtime.accessToken && runtime.children.length === 0 ? (
          <p className="proto-muted">当前还没有孩子档案，先创建第一位孩子。</p>
        ) : null}
        {!runtime.loading && runtime.accessToken && runtime.children.length > 0 ? (
          <ul className="proto-bullets">
            {runtime.children.map((child) => {
              const isActive = child.id === runtime.selectedChildId;
              return (
                <li key={child.id}>
                  <div className="proto-row">
                    <strong>{child.label}</strong>
                    <span>{child.id}</span>
                  </div>
                  <div className="proto-actions">
                    <button
                      type="button"
                      className={isActive ? "button-secondary" : "button-primary"}
                      onClick={() => runtime.setSelectedChildId(child.id)}
                      disabled={isActive}
                    >
                      {isActive ? "当前孩子" : "设为当前孩子"}
                    </button>
                    <Link href={`/children/${child.id}/edit`} className="button-secondary">
                      编辑档案
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </ParentShell>
  );
}
