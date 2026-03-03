import { ParentShell } from "@/components/prototype/parent-shell";

export default function AnalysisReportPage() {
  return (
    <ParentShell title="分析报告" subtitle="近 3 个月综合发展变化" activePath="/quick-menu">
      <section className="proto-panel">
        <h2>综合发展分析报告</h2>
        <p className="proto-muted">综合评分 58 → 72，感觉运动提升明显，情绪行为仍需重点干预。</p>
      </section>

      <section className="proto-panel">
        <h3>六大领域评分</h3>
        <ul className="proto-bullets">
          <li>语言沟通：74</li>
          <li>社交互动：68</li>
          <li>认知学习：70</li>
          <li>感觉运动：82</li>
          <li>情绪行为：55</li>
          <li>生活适应：60</li>
        </ul>
      </section>

      <section className="proto-panel">
        <h3>行为 ABC 分析</h3>
        <p className="proto-muted">前因：任务切换/疲劳；行为：哭闹+逃避；结果：安抚后恢复，建议预告切换并提供视觉支持。</p>
      </section>
    </ParentShell>
  );
}
