"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

type ConsentScope = {
  id: string;
  name: string;
  granted: boolean;
  updatedAt: string;
};

const seedScopes: ConsentScope[] = [
  {
    id: "scope-training",
    name: "训练数据分析",
    granted: true,
    updatedAt: "2026-03-05",
  },
  {
    id: "scope-report",
    name: "评估报告生成",
    granted: true,
    updatedAt: "2026-03-05",
  },
  {
    id: "scope-marketing",
    name: "运营通知推荐",
    granted: false,
    updatedAt: "2026-03-01",
  },
];

export default function DataConsentPage() {
  const [scopes, setScopes] = useState<ConsentScope[]>(seedScopes);
  const [message, setMessage] = useState<string | null>(null);

  const revokeOne = (scopeId: string) => {
    setScopes((previous) =>
      previous.map((scope) =>
        scope.id === scopeId
          ? {
              ...scope,
              granted: false,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : scope,
      ),
    );
    setMessage("授权已更新。");
  };

  return (
    <ParentShell title="数据授权" subtitle="可审计地管理数据使用范围与撤回状态" activePath="/settings">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>数据授权管理</h2>
          <button type="button" className="button-secondary" onClick={() => revokeOne("scope-training")}>
            撤回授权
          </button>
        </div>
        <p className="proto-muted">你可以随时撤回授权，撤回后新数据将不再参与对应能力生成。</p>
        {message ? <p className="proto-muted">{message}</p> : null}
        <ul className="proto-bullets">
          {scopes.map((scope) => (
            <li key={scope.id}>
              <div className="proto-row">
                <strong>{scope.name}</strong>
                <span>{scope.granted ? "已授权" : "未授权"}</span>
              </div>
              <p className="proto-muted">更新时间：{scope.updatedAt}</p>
            </li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}
