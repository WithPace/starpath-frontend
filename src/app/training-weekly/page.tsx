import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";

const dailyItems = [
  { day: "周一 2/14", tags: ["共同注意", "口语仿说"], score: "4.2" },
  { day: "周三 2/16", tags: ["情绪识别", "手部精细"], score: "3.8" },
  { day: "周五 2/18", tags: ["指令跟随", "生活自理"], score: "4.5" },
];

export default function TrainingWeeklyPage() {
  return (
    <ParentShell title="一周训练记录" subtitle="训练频次、完成度与领域进展" activePath="/quick-menu">
      <section className="proto-panel">
        <h2>一周训练记录</h2>
        <p className="proto-muted">训练天数 6 天 · 完成项目 18 项 · 平均评分 4.2</p>
        <ul className="proto-bullets">
          {dailyItems.map((item) => (
            <li key={item.day}>
              {item.day} · {item.tags.join(" / ")} · 评分 {item.score}
            </li>
          ))}
        </ul>
        <Link href="/training-detail" className="button-primary">
          查看详细记录
        </Link>
      </section>
    </ParentShell>
  );
}
