"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";
import { resolveAuthNextPath } from "@/lib/runtime/auth-next";
import {
  clearManualRuntimeCredentials,
  persistManualRuntimeCredentials,
  readManualRuntimeCredentialsFromWindow,
} from "@/lib/runtime/runtime-credentials";

export default function AuthPage() {
  const router = useRouter();
  const client = tryCreateBrowserSupabaseClient();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [manualChildId, setManualChildId] = useState("");
  const [sessionIdentity, setSessionIdentity] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const nextPath =
    typeof window === "undefined"
      ? "/"
      : resolveAuthNextPath(new URLSearchParams(window.location.search).get("next"));

  useEffect(() => {
    if (!client) return;

    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSessionIdentity(data.session?.user.phone ?? data.session?.user.email ?? null);
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
    setSessionIdentity(data.session?.user.phone ?? data.session?.user.email ?? null);
    const manual = readManualRuntimeCredentialsFromWindow();
    setManualToken(manual.manualAccessToken ?? "");
    setManualChildId(manual.manualChildId ?? "");
  };

  const sendOtp = async () => {
    if (!client) {
      setMessage("缺少 Supabase 前端环境变量，无法执行验证码登录。");
      return;
    }
    if (!phone.trim()) {
      setMessage("请先输入手机号。");
      return;
    }

    setPending(true);
    setMessage(null);
    const { error } = await client.auth.signInWithOtp({
      phone: phone.trim(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage(`发送验证码失败：${error.message}`);
      setPending(false);
      return;
    }

    setMessage("验证码已发送，请查收短信。");
    setPending(false);
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) {
      setMessage("缺少 Supabase 前端环境变量，无法执行验证码登录。");
      return;
    }
    if (!phone.trim() || !otp.trim()) {
      setMessage("请输入手机号和验证码。");
      return;
    }

    setPending(true);
    setMessage(null);
    const { error } = await client.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: "sms",
    });

    if (error) {
      setMessage(`验证码登录失败：${error.message}`);
      setPending(false);
      return;
    }

    await refreshState();
    setMessage("登录成功。");
    router.replace(nextPath);
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

        <p className="runtime-panel__status">当前会话：{sessionIdentity ?? "未登录"}</p>
        {!client ? (
          <p className="runtime-panel__warning">
            当前环境未配置 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。
          </p>
        ) : null}
        {message ? <p className="muted-text">{message}</p> : null}

        <section aria-label="supabase-auth" className="form-grid">
          <h2>手机号验证码登录</h2>
          <form onSubmit={verifyOtp}>
            <label>
              手机号
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+8613800138000"
                required
                autoComplete="tel"
              />
            </label>
            <label>
              验证码
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="6位短信验证码"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </label>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={pending}
                className="button-secondary"
              >
                发送验证码
              </button>
              <button type="submit" disabled={pending} className="button-primary">
                验证码登录
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
