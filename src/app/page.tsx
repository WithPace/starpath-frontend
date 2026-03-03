import Link from "next/link";

import { getRoleLaunchItems } from "@/lib/runtime/role-ui";

const launchChecklist = [
  "`.env.local` 已配置 NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "已通过 `/auth` 完成账号登录并确认孩子上下文",
  "`bash scripts/ci/frontend_final_gate.sh` 通过",
  "后端 `bash scripts/ci/release_go_live.sh` 通过",
];

export default function Home() {
  const roleItems = getRoleLaunchItems();

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <p className="landing-hero__kicker">Harness Engineering Delivery</p>
        <h1>StarPath 多角色工作台</h1>
        <p className="landing-hero__subtitle">
          一个统一入口覆盖家长、医生、特教老师与机构管理员，直接连通 Supabase + Orchestrator 执行链路。
        </p>
        <div className="landing-hero__actions">
          <Link href="/auth" className="button-primary">
            去认证与运行时配置
          </Link>
        </div>
      </section>

      <section className="landing-grid" aria-label="role-launch-grid">
        {roleItems.map((item) => (
          <article key={item.title} className="landing-card">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="landing-card__actions">
              {item.actions.map((action) => (
                <Link key={action.label} href={action.href}>
                  {action.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="landing-checklist">
        <h2>上线前检查</h2>
        <ul>
          {launchChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
