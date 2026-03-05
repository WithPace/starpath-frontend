"use client";

import Link from "next/link";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function PrivacyPage() {
  return (
    <ParentShell title="隐私政策" subtitle="数据采集与使用说明" activePath="/settings">
      <section className="proto-panel">
        <h2>隐私政策</h2>
        <ul className="proto-bullets">
          <li>
            <strong>数据范围</strong>
            <p className="proto-muted">仅采集账号、孩子档案及训练相关必要数据用于功能服务。</p>
          </li>
          <li>
            <strong>数据用途</strong>
            <p className="proto-muted">用于生成个性化建议、看板与训练追踪，不作未授权商业用途。</p>
          </li>
          <li>
            <strong>用户权利</strong>
            <p className="proto-muted">你可在设置页进行授权调整、导出或申请删除。</p>
          </li>
        </ul>
        <Link href="/settings" className="button-link">
          返回设置
        </Link>
      </section>
    </ParentShell>
  );
}
