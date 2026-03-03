"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  clearManualRuntimeCredentials,
  persistManualRuntimeCredentials,
  readManualRuntimeCredentialsFromWindow,
} from "@/lib/runtime/runtime-credentials";

export default function AuthPage() {
  const client = tryCreateBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [manualChildId, setManualChildId] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!client) return;

    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSessionEmail(data.session?.user.email ?? null);
      const manual = readManualRuntimeCredentialsFromWindow();
      setManualToken(manual.manualAccessToken ?? "");
      setManualChildId(manual.manualChildId ?? "");
    });

    return () => {
      active = false;
    };
  }, [client]);

  const refreshState = async () => {
    if (!client) return;

    const { data } = await client.auth.getSession();
    setSessionEmail(data.session?.user.email ?? null);
    const manual = readManualRuntimeCredentialsFromWindow();
    setManualToken(manual.manualAccessToken ?? "");
    setManualChildId(manual.manualChildId ?? "");
  };

  const submitSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) {
      setMessage("缺少 Supabase 前端环境变量，无法执行登录。");
      return;
    }

    setPending(true);
    setMessage(null);
    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`登录失败：${error.message}`);
      setPending(false);
      return;
    }

    await refreshState();
    setMessage("登录成功。");
    setPending(false);
  };

  const submitSignUp = async () => {
    if (!client) {
      setMessage("缺少 Supabase 前端环境变量，无法执行注册。");
      return;
    }

    setPending(true);
    setMessage(null);
    const { error } = await client.auth.signUp({ email, password });

    if (error) {
      setMessage(`注册失败：${error.message}`);
      setPending(false);
      return;
    }

    await refreshState();
    setMessage("注册请求已提交，请按 Supabase 配置完成邮箱验证后登录。");
    setPending(false);
  };

  const submitManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persistManualRuntimeCredentials(window.localStorage, {
      manualAccessToken: manualToken,
      manualChildId,
    });
    await refreshState();
    setMessage("手动运行时配置已保存。");
  };

  const signOut = async () => {
    if (!client) {
      setMessage("缺少 Supabase 前端环境变量，无法退出会话。");
      return;
    }
    setPending(true);
    await client.auth.signOut();
    await refreshState();
    setMessage("已退出登录。");
    setPending(false);
  };

  const clearManual = async () => {
    clearManualRuntimeCredentials(window.localStorage);
    await refreshState();
    setMessage("手动运行时配置已清空。");
  };

  return (
    <main className="app-shell auth-shell">
      <section className="surface-card">
        <header className="role-header">
          <div>
            <p className="role-kicker">Setup</p>
            <h1 className="page-title">认证与运行时配置</h1>
          </div>
          <nav className="role-nav" aria-label="auth-nav">
            <Link href="/" className="button-link">
              返回首页
            </Link>
            <Link href="/chat" className="button-link">
              家长端对话
            </Link>
          </nav>
        </header>

        <p className="runtime-panel__status">当前会话：{sessionEmail ?? "未登录"}</p>
        {!client ? (
          <p className="runtime-panel__warning">
            当前环境未配置 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。
          </p>
        ) : null}
        {message ? <p className="muted-text">{message}</p> : null}

        <section aria-label="supabase-auth" className="form-grid">
          <h2>Supabase 登录</h2>
          <form onSubmit={submitSignIn}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <div className="form-actions">
              <button type="submit" disabled={pending} className="button-primary">
                登录
              </button>
              <button type="button" onClick={() => void submitSignUp()} disabled={pending} className="button-secondary">
                注册
              </button>
              <button type="button" onClick={() => void signOut()} disabled={pending} className="button-secondary">
                退出
              </button>
            </div>
          </form>
        </section>

        <section aria-label="manual-runtime" className="form-grid">
          <h2>手动运行时（联调用）</h2>
          <form onSubmit={submitManual}>
            <label>
              Access Token
              <textarea
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                rows={4}
                placeholder="粘贴 JWT"
              />
            </label>
            <label>
              Child ID
              <input
                value={manualChildId}
                onChange={(event) => setManualChildId(event.target.value)}
                placeholder="uuid"
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="button-primary">保存手动配置</button>
              <button type="button" onClick={() => void clearManual()} className="button-secondary">
                清空手动配置
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
