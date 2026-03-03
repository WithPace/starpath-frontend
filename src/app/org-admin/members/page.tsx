"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
import {
  buildInvitePayload,
  isPermissionDeniedMessage,
  normalizeStatusPatch,
} from "@/lib/runtime/org-members";
import { reportRuntimeError } from "@/lib/runtime/runtime-telemetry";
import { useProtectedRoute } from "@/lib/runtime/use-protected-route";
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
  const router = useRouter();
  const runtime = useRoleRuntime("org_admin");
  const routeDecision = useProtectedRoute(runtime.accessToken, runtime.loading);
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [inviteOrgId, setInviteOrgId] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("teacher");
  const [invitePending, setInvitePending] = useState(false);
  const [rowPendingId, setRowPendingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!routeDecision.allow) {
      setMembers([]);
      setError(null);
      return;
    }

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
        setError("当前账号不属于任何机构，无法读取成员列表。");
        return;
      }

      if (!inviteOrgId) {
        setInviteOrgId(orgIds[0]);
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
      const errorMessage = memberError instanceof Error ? memberError.message : "读取成员失败";
      reportRuntimeError({
        scope: "org_members",
        message: errorMessage,
        context: { route: "/org-admin/members", action: "list" },
      });

      setMembers([]);
      setError(errorMessage);

      if (isPermissionDeniedMessage(errorMessage)) {
        router.replace("/forbidden?reason=permission_denied&role=org_admin");
      }
    } finally {
      setLoading(false);
    }
  }, [client, inviteOrgId, routeDecision.allow, router, runtime.isAuthenticated]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const submitInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!client) {
      setError("缺少 Supabase 前端环境变量，无法写入成员数据。");
      return;
    }

    try {
      setInvitePending(true);
      setNotice(null);
      setError(null);

      const payload = buildInvitePayload({
        orgId: inviteOrgId,
        userId: inviteUserId,
        orgRole: inviteRole,
      });

      const insertResp = await client.from("org_members").insert(payload);
      if (insertResp.error) {
        throw new Error(`创建成员失败：${insertResp.error.message}`);
      }

      setInviteUserId("");
      setNotice("成员已添加。\n如果该用户已有同机构同角色记录，请改为修改状态。");
      await loadMembers();
    } catch (inviteError) {
      const errorMessage = inviteError instanceof Error ? inviteError.message : "创建成员失败";
      reportRuntimeError({
        scope: "org_members",
        message: errorMessage,
        context: {
          route: "/org-admin/members",
          action: "invite",
          orgId: inviteOrgId,
          userId: inviteUserId,
          orgRole: inviteRole,
        },
      });

      setError(errorMessage);
      if (isPermissionDeniedMessage(errorMessage)) {
        router.replace("/forbidden?reason=permission_denied&role=org_admin");
      }
    } finally {
      setInvitePending(false);
    }
  };

  const updateStatus = async (memberId: string, nextStatus: string) => {
    if (!client) {
      setError("缺少 Supabase 前端环境变量，无法更新成员状态。");
      return;
    }

    try {
      setRowPendingId(memberId);
      setNotice(null);
      setError(null);

      const patch = normalizeStatusPatch(nextStatus);
      const updateResp = await client.from("org_members").update(patch).eq("id", memberId);
      if (updateResp.error) {
        throw new Error(`更新成员状态失败：${updateResp.error.message}`);
      }

      setNotice(`成员状态已更新为 ${patch.status}。`);
      await loadMembers();
    } catch (statusError) {
      const errorMessage = statusError instanceof Error ? statusError.message : "更新成员状态失败";
      reportRuntimeError({
        scope: "org_members",
        message: errorMessage,
        context: {
          route: "/org-admin/members",
          action: "update_status",
          memberId,
          nextStatus,
        },
      });

      setError(errorMessage);
      if (isPermissionDeniedMessage(errorMessage)) {
        router.replace("/forbidden?reason=permission_denied&role=org_admin");
      }
    } finally {
      setRowPendingId(null);
    }
  };

  if (!routeDecision.allow) {
    return (
      <main>
        <h1>机构成员管理</h1>
        <p>正在跳转到认证页面...</p>
      </main>
    );
  }

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

      <section aria-label="org-member-editor" style={{ marginBottom: 20 }}>
        <h2>新增成员</h2>
        <form onSubmit={submitInvite} style={{ display: "grid", gap: 8, maxWidth: 720 }}>
          <label>
            机构 ID
            <input value={inviteOrgId} onChange={(event) => setInviteOrgId(event.target.value)} required />
          </label>
          <label>
            用户 ID
            <input value={inviteUserId} onChange={(event) => setInviteUserId(event.target.value)} required />
          </label>
          <label>
            机构角色
            <input value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} required />
          </label>
          <button type="submit" disabled={invitePending}>
            {invitePending ? "提交中..." : "添加成员"}
          </button>
        </form>
      </section>

      <section aria-label="org-member-list">
        <h2>成员列表</h2>
        {loading ? <p>成员加载中...</p> : null}
        {notice ? <p>{notice}</p> : null}
        {error ? <p>成员处理失败：{error}</p> : null}
        {!loading && !error && members.length === 0 ? <p>暂无成员数据</p> : null}
        {!loading && !error && members.length > 0 ? (
          <ul>
            {members.map((member) => (
              <li key={member.id} style={{ marginBottom: 8 }}>
                <div>
                  org={member.org_id} / user={member.user_id} / role={member.org_role} / status={member.status}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <label>
                    更新状态
                    <select
                      defaultValue={member.status}
                      onChange={(event) => void updateStatus(member.id, event.target.value)}
                      disabled={rowPendingId === member.id}
                      aria-label={`member-status-${member.id}`}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
