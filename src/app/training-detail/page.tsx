"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

const weekOptions = ["本周", "上周", "上上周"] as const;

export default function TrainingDetailPage() {
  const [week, setWeek] = useState<(typeof weekOptions)[number]>("本周");

  return (
    <ParentShell title="训练详情" subtitle="周切换 + 日期锚点导航" activePath="/quick-menu">
      <section className="proto-panel">
        <h2>详细训练记录</h2>
        <p className="proto-muted">周切换</p>
        <div className="proto-chip-row" aria-label="week-switch">
          {weekOptions.map((item) => (
            <button
              key={item}
              type="button"
              className={item === week ? "chip-button active" : "chip-button"}
              onClick={() => setWeek(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="proto-panel">
        <h3>{week} · 日期锚点</h3>
        <ul className="proto-bullets">
          <li>周一：共同注意 + 吹泡泡游戏（15 分钟）</li>
          <li>周三：情绪识别 + 指令跟随（20 分钟）</li>
          <li>周五：生活自理 + 模仿训练（18 分钟）</li>
        </ul>
      </section>
    </ParentShell>
  );
}
