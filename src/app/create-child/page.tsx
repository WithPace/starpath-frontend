"use client";

import { FormEvent, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function CreateChildPage() {
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [domain, setDomain] = useState("语言沟通");
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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
          <button type="submit" className="button-primary">保存并生成档案</button>
        </form>
      </section>
      {submitted ? (
        <section className="proto-panel">
          <h2>档案预览</h2>
          <p className="proto-muted">已记录：{nickname}，{age}岁，当前聚焦 {domain}。</p>
        </section>
      ) : null}
    </ParentShell>
  );
}
