import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>权限不足</h1>
      <p>当前账号没有权限访问该资源，请联系管理员或切换账号后重试。</p>
      <ul>
        <li>
          <Link href="/auth">前往认证页面</Link>
        </li>
        <li>
          <Link href="/">返回首页</Link>
        </li>
      </ul>
    </main>
  );
}
