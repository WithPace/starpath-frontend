import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function WelcomePage() {
  return (
    <ParentShell title="星途AI" subtitle="陪伴每个家庭走向更清晰的康复路径" activePath="/welcome">
      <section className="proto-panel proto-center">
        <p className="proto-kicker">00 · 欢迎页</p>
        <h2>从一次对话开始，连接评估、训练与记录</h2>
        <p className="proto-muted">
          通过 AI 对话完成筛查、拿到训练建议并持续追踪变化。支持家长、医生、老师与机构协同。
        </p>
        <div className="proto-actions">
          <Link href="/auth" className="button-primary">
            开始使用
          </Link>
          <Link href="/chat" className="button-secondary">
            进入体验
          </Link>
        </div>
      </section>
    </ParentShell>
  );
}
