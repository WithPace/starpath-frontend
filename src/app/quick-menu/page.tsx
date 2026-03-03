import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";

const menuItems = [
  { name: "孩子档案", href: "/create-child", icon: "👶" },
  { name: "数据看板", href: "/dashboard", icon: "📊" },
  { name: "评估报告", href: "/assessment", icon: "🧪" },
  { name: "训练记录", href: "/training-weekly", icon: "📋" },
  { name: "情绪日历", href: "/analysis-report", icon: "😊" },
  { name: "生活记录", href: "/voice-record", icon: "📅" },
  { name: "照护团队", href: "/org-admin/members", icon: "👥" },
  { name: "成就墙", href: "/card-fullscreen", icon: "⭐" },
];

export default function QuickMenuPage() {
  return (
    <ParentShell title="快捷菜单" subtitle="从对话快速跳转到关键能力页" activePath="/quick-menu">
      <section className="proto-panel">
        <header className="proto-section-header">
          <h2>快捷入口</h2>
          <Link href="/chat" className="button-link">返回对话</Link>
        </header>
        <div className="proto-grid-8">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="proto-grid-item">
              <span className="proto-grid-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="proto-panel">
        <h3>本周数据摘要</h3>
        <ul className="proto-bullets">
          <li>训练 14 次 · 210 分钟 · 完成率 86%</li>
          <li>情绪：😊 4 天 / 😐 2 天 / 😢 1 天</li>
          <li>里程碑：主动问候出现泛化</li>
        </ul>
      </section>
    </ParentShell>
  );
}
