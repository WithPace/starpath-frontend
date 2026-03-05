"use client";

import { useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

type NotificationTab = "all" | "training" | "system";
type NotificationRow = {
  id: string;
  type: NotificationTab;
  title: string;
  summary: string;
  unread: boolean;
};

const seedRows: NotificationRow[] = [
  {
    id: "n-1",
    type: "training",
    title: "训练计划更新",
    summary: "AI 建议将语言沟通训练提前到晚饭前。",
    unread: true,
  },
  {
    id: "n-2",
    type: "system",
    title: "系统维护提醒",
    summary: "今晚 23:00-23:30 会进行短时维护。",
    unread: false,
  },
  {
    id: "n-3",
    type: "training",
    title: "周报已生成",
    summary: "本周训练频次达标，建议进入下一阶段目标。",
    unread: true,
  },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<NotificationTab>("all");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>(seedRows);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (tab !== "all" && row.type !== tab) return false;
      if (onlyUnread && !row.unread) return false;
      return true;
    });
  }, [onlyUnread, rows, tab]);

  const markAllRead = () => {
    setRows((previous) => previous.map((row) => ({ ...row, unread: false })));
  };

  return (
    <ParentShell title="通知中心" subtitle="训练提醒、系统通知与风险预警" activePath="/quick-menu">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>通知中心</h2>
          <button type="button" className="button-secondary" onClick={() => setOnlyUnread((prev) => !prev)}>
            仅看未读
          </button>
        </div>
        <div className="proto-chip-row">
          <button type="button" className={tab === "all" ? "chip-button active" : "chip-button"} onClick={() => setTab("all")}>
            全部
          </button>
          <button
            type="button"
            className={tab === "training" ? "chip-button active" : "chip-button"}
            onClick={() => setTab("training")}
          >
            训练通知
          </button>
          <button
            type="button"
            className={tab === "system" ? "chip-button active" : "chip-button"}
            onClick={() => setTab("system")}
          >
            系统消息
          </button>
        </div>
        <button type="button" className="button-link" onClick={markAllRead}>
          全部标记已读
        </button>
      </section>

      <section className="proto-panel">
        <ul className="proto-bullets">
          {visibleRows.map((row) => (
            <li key={row.id}>
              <div className="proto-row">
                <strong>{row.title}</strong>
                <span>{row.unread ? "未读" : "已读"}</span>
              </div>
              <p className="proto-muted">{row.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}
