"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ParentShell } from "@/components/prototype/parent-shell";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ChildEditPage() {
  const params = useParams<{ id: string }>();
  const childId = typeof params?.id === "string" ? params.id : "";

  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !childId || !runtime.accessToken) return;

    const run = async () => {
      setLoading(true);
      setErrorText(null);

      const resp = await client
        .from("children")
        .select("nickname,real_name,birth_date")
        .eq("id", childId)
        .maybeSingle();

      if (resp.error) {
        setErrorText(resp.error.message);
        setLoading(false);
        return;
      }

      const row = resp.data as
        | {
            nickname?: string | null;
            real_name?: string | null;
            birth_date?: string | null;
          }
        | null;

      setNickname(row?.nickname ?? "");
      setRealName(row?.real_name ?? "");
      setBirthDate(row?.birth_date ?? "");
      setLoading(false);
    };

    void run();
  }, [childId, client, runtime.accessToken]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!client) {
      setErrorText("缺少 Supabase 前端配置，无法保存档案。");
      setMessage(null);
      return;
    }
    if (!childId) {
      setErrorText("缺少 child_id，无法保存档案。");
      setMessage(null);
      return;
    }

    try {
      setSaving(true);
      setErrorText(null);
      const payload = {
        nickname: nickname.trim() || null,
        real_name: realName.trim() || null,
        birth_date: birthDate.trim() || null,
      };
      const resp = await client.from("children").update(payload).eq("id", childId);
      if (resp.error) {
        throw new Error(resp.error.message);
      }
      setMessage("档案已保存。");
    } catch (error) {
      setMessage(null);
      setErrorText(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  };

  const childNotInRuntime =
    runtime.children.length > 0 && !runtime.children.some((child) => child.id === childId);

  return (
    <ParentShell title="编辑孩子档案" subtitle="维护基础信息，保证训练链路准确" activePath="/quick-menu">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>编辑孩子档案</h2>
          <Link href="/children" className="button-secondary">
            返回列表
          </Link>
        </div>
        {runtime.loading ? <p className="proto-muted">运行时加载中...</p> : null}
        {!runtime.loading && !runtime.accessToken ? (
          <p className="proto-muted">当前未登录，请先到认证页登录。</p>
        ) : null}
        {childNotInRuntime ? <p className="proto-muted">当前账号未绑定该孩子，建议先检查授权关系。</p> : null}
        {loading ? <p className="proto-muted">档案加载中...</p> : null}

        <form className="proto-form" onSubmit={submit}>
          <label>
            昵称
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <label>
            真实姓名
            <input value={realName} onChange={(event) => setRealName(event.target.value)} />
          </label>
          <label>
            生日
            <input value={birthDate} onChange={(event) => setBirthDate(event.target.value)} placeholder="YYYY-MM-DD" />
          </label>
          <button type="submit" className="button-primary" disabled={saving}>
            {saving ? "保存中..." : "保存档案"}
          </button>
        </form>

        {message ? <p className="proto-muted">{message}</p> : null}
        {errorText ? <p className="proto-muted">保存失败：{errorText}</p> : null}
      </section>
    </ParentShell>
  );
}
