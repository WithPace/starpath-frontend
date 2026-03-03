"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

type SettingsTab = "account" | "preference" | "legal" | "other";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("account");

  return (
    <ParentShell title="设置" subtitle="账号、偏好与隐私控制" activePath="/settings">
      <section className="proto-panel">
        <div className="proto-chip-row">
          <button type="button" className={tab === "account" ? "chip-button active" : "chip-button"} onClick={() => setTab("account")}>
            账号信息
          </button>
          <button type="button" className={tab === "preference" ? "chip-button active" : "chip-button"} onClick={() => setTab("preference")}>
            偏好设置
          </button>
          <button type="button" className={tab === "legal" ? "chip-button active" : "chip-button"} onClick={() => setTab("legal")}>
            法律信息
          </button>
          <button type="button" className={tab === "other" ? "chip-button active" : "chip-button"} onClick={() => setTab("other")}>
            其他
          </button>
        </div>
      </section>

      {tab === "account" ? (
        <section className="proto-panel">
          <h2>账号信息</h2>
          <ul className="proto-bullets">
            <li>修改昵称</li>
            <li>修改手机号（短信验证码）</li>
          </ul>
        </section>
      ) : null}

      {tab === "preference" ? (
        <section className="proto-panel">
          <h2>偏好设置</h2>
          <ul className="proto-bullets">
            <li>训练提醒时间</li>
            <li>AI 回复风格（简洁 / 详细 / 温暖）</li>
            <li>数据访问权限（按孩子授权）</li>
          </ul>
        </section>
      ) : null}

      {tab === "legal" ? (
        <section className="proto-panel">
          <h2>法律信息</h2>
          <ul className="proto-bullets">
            <li>用户协议</li>
            <li>隐私政策</li>
          </ul>
        </section>
      ) : null}

      {tab === "other" ? (
        <section className="proto-panel">
          <h2>其他</h2>
          <ul className="proto-bullets">
            <li>关于星途</li>
            <li>意见反馈</li>
            <li>升级 VIP</li>
            <li>注销账号</li>
          </ul>
        </section>
      ) : null}
    </ParentShell>
  );
}
