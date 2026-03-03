"use client";

import { useEffect, useMemo, useState } from "react";

import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";

type OrgMember = {
  id: string;
  org_id: string;
  user_id: string;
  org_role: string;
  status: string;
};

export default function OrgAdminMembersPage() {
  const runtime = useRoleRuntime("org_admin");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      if (!runtime.isAuthenticated) {
        setMembers([]);
        setError("请先登录后查看机构成员。");
        return;
      }

      if (!client) {
        setMembers([]);
        setError("缺少 Supabase 前端环境变量，无法读取成员数据。");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const sessionResp = await client.auth.getSession();
        const userId = sessionResp.data.session?.user.id;
        if (!userId) {
          setMembers([]);
          setError("会话用户缺失，请重新登录。");
          return;
        }

        const selfMembershipResp = await client
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .eq("status", "active");

        if (selfMembershipResp.error) {
          throw new Error(`读取机构归属失败：${selfMembershipResp.error.message}`);
        }

        const orgIds = Array.from(
          new Set(((selfMembershipResp.data as { org_id: string }[] | null) ?? []).map((row) => row.org_id)),
        );

        if (orgIds.length === 0) {
          setMembers([]);
          return;
        }

        const membersResp = await client
          .from("org_members")
          .select("id,org_id,user_id,org_role,status")
          .in("org_id", orgIds)
          .order("created_at", { ascending: false });

        if (membersResp.error) {
          throw new Error(`读取成员列表失败：${membersResp.error.message}`);
        }

        setMembers((membersResp.data as OrgMember[] | null) ?? []);
      } catch (memberError) {
        setMembers([]);
        setError(memberError instanceof Error ? memberError.message : "读取成员失败");
      } finally {
        setLoading(false);
      }
    };

    void loadMembers();
  }, [client, runtime.isAuthenticated]);

  return (
    <main>
      <h1>机构成员管理</h1>
      <RoleRuntimePanel
        roleLabel="机构管理员"
        loading={runtime.loading}
        warning={runtime.warning}
        isAuthenticated={runtime.isAuthenticated}
        sessionEmail={runtime.sessionEmail}
        childOptions={runtime.children}
        selectedChildId={runtime.selectedChildId}
        onSelectChild={runtime.setSelectedChildId}
        onRefresh={runtime.refresh}
        onSignOut={runtime.signOut}
      />
      <section aria-label="org-member-list">
        <h2>成员列表</h2>
        {loading ? <p>成员加载中...</p> : null}
        {error ? <p>成员加载失败：{error}</p> : null}
        {!loading && !error && members.length === 0 ? <p>暂无成员数据</p> : null}
        {!loading && !error && members.length > 0 ? (
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                org={member.org_id} / user={member.user_id} / role={member.org_role} / status={member.status}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
