import { ParentShell } from "@/components/prototype/parent-shell";

export default function HomeGuidePage() {
  return (
    <ParentShell title="居家指导" subtitle="按场景拆分的可执行训练建议" activePath="/quick-menu">
      <section className="proto-panel">
        <p className="proto-kicker">08 · 居家指导</p>
        <h2>今天可执行的 3 个训练步骤</h2>
        <ol className="proto-ordered">
          <li>共同注意：吹泡泡 + 指向跟随（10 分钟）</li>
          <li>语言仿说：双词短句练习（8 分钟）</li>
          <li>生活适应：独立收纳玩具（6 分钟）</li>
        </ol>
      </section>
      <section className="proto-panel">
        <h3>家庭执行提示</h3>
        <ul className="proto-bullets">
          <li>一次只给一个指令，配合手势提示。</li>
          <li>完成后立即强化（拥抱/贴纸/口头鼓励）。</li>
          <li>情绪波动时先做安抚，再回到任务。</li>
        </ul>
      </section>
    </ParentShell>
  );
}
