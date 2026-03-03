"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

type CardTab = "trend" | "radar" | "assessment";

export default function CardFullscreenPage() {
  const [tab, setTab] = useState<CardTab>("trend");

  return (
    <ParentShell title="卡片全屏" subtitle="缩略卡片展开后的沉浸视图" activePath="/quick-menu" hideBottomNav>
      <section className="proto-panel">
        <div className="proto-chip-row">
          <button type="button" className={tab === "trend" ? "chip-button active" : "chip-button"} onClick={() => setTab("trend")}>
            训练趋势
          </button>
          <button type="button" className={tab === "radar" ? "chip-button active" : "chip-button"} onClick={() => setTab("radar")}>
            能力画像
          </button>
          <button type="button" className={tab === "assessment" ? "chip-button active" : "chip-button"} onClick={() => setTab("assessment")}>
            评估报告
          </button>
        </div>
      </section>

      <section className="proto-panel proto-chart-panel">
        {tab === "trend" ? <h2>近30天训练趋势（全屏态）</h2> : null}
        {tab === "radar" ? <h2>六领域雷达图（全屏态）</h2> : null}
        {tab === "assessment" ? <h2>评估结果详情（全屏态）</h2> : null}
        <p className="proto-muted">支持时间切换、缩放、分享与导出。</p>
      </section>
    </ParentShell>
  );
}
