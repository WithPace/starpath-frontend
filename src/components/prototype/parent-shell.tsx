import Link from "next/link";
import type { ReactNode } from "react";

type ParentShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  activePath?: string;
  hideBottomNav?: boolean;
};

const bottomNavItems = [
  { href: "/welcome", label: "首页" },
  { href: "/chat", label: "对话" },
  { href: "/quick-menu", label: "菜单" },
  { href: "/settings", label: "设置" },
];

export function ParentShell({
  title,
  subtitle,
  children,
  activePath,
  hideBottomNav = false,
}: ParentShellProps) {
  return (
    <main className="proto-shell">
      <section className="proto-device">
        <header className="proto-topbar">
          <div>
            <h1 className="proto-title">{title}</h1>
            {subtitle ? <p className="proto-subtitle">{subtitle}</p> : null}
          </div>
          <div className="proto-capsule">
            <button type="button" aria-label="胶囊菜单">···</button>
            <span className="proto-capsule__divider" />
            <button type="button" aria-label="关闭页面">×</button>
          </div>
        </header>

        <section className="proto-content">{children}</section>

        {!hideBottomNav ? (
          <nav className="proto-bottom-nav" aria-label="parent-bottom-nav">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={activePath === item.href ? "active" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
