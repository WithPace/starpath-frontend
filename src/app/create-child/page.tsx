"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ParentShell } from "@/components/prototype/parent-shell";
import { createChildProfile } from "@/lib/prototype/parent-data-access";
import { persistManualChildId } from "@/lib/runtime/runtime-credentials";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

export default function CreateChildPage() {
  const router = useRouter();
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [domain, setDomain] = useState("语言沟通");
  const [isSaving, setIsSaving] = useState(false);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!client) {
      setErrorText("缺少 Supabase 前端配置，请先检查 .env.local。");
      setSuccessText(null);
      return;
    }

    try {
      setIsSaving(true);
      setSuccessText(null);
      setErrorText(null);
      setWarnings([]);

      const result = await createChildProfile(client, {
        nickname,
        age,
      });

      setSuccessText(`档案已保存：${nickname}（child_id: ${result.childId}）`);
      setWarnings(result.warnings);
      persistManualChildId(result.childId);
      router.replace("/assessment");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "保存失败，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ParentShell title="创建档案" subtitle="AI 引导式收集孩子核心信息" activePath="/quick-menu">
      <section className="proto-panel">
        <p className="proto-kicker">05 · 创建孩子</p>
        <form className="proto-form" onSubmit={submit}>
          <label>
            昵称
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} required />
          </label>
          <label>
            年龄
            <input value={age} onChange={(event) => setAge(event.target.value)} required />
          </label>
          <label>
            当前重点领域
            <select value={domain} onChange={(event) => setDomain(event.target.value)}>
              <option>语言沟通</option>
              <option>社交互动</option>
              <option>认知学习</option>
              <option>感觉运动</option>
              <option>情绪行为</option>
              <option>生活适应</option>
            </select>
          </label>
          <button type="submit" className="button-primary" disabled={isSaving}>
            {isSaving ? "保存中..." : "保存并生成档案"}
          </button>
        </form>
      </section>

      {successText ? (
        <section className="proto-panel">
          <h2>档案已保存</h2>
          <p className="proto-muted">{successText}</p>
          <p className="proto-muted">当前聚焦：{domain}。</p>
          {warnings.length > 0 ? (
            <ul className="proto-bullets">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {errorText ? (
        <section className="proto-panel">
          <h2>保存失败</h2>
          <p className="proto-muted">{errorText}</p>
        </section>
      ) : null}
    </ParentShell>
  );
}
