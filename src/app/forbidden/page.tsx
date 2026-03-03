import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="app-shell">
      <section className="surface-card">
        <p className="role-kicker">Access Control</p>
        <h1 className="page-title">权限不足</h1>
        <p className="muted-text">当前账号没有权限访问该资源，请联系管理员或切换账号后重试。</p>
        <div className="form-actions">
          <Link href="/auth" className="button-primary">
            前往认证页面
          </Link>
          <Link href="/" className="button-link">
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}
