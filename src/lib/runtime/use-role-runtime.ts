"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { OrchestratorRole } from "@/lib/api/orchestrator-client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

import { buildChildOptions, pickRuntimeAccessToken, resolveSelectedChildId, type ChildOption } from "./role-runtime";
import {
  normalizeManualChildId,
  persistManualChildId,
  readManualRuntimeCredentialsFromWindow,
} from "./runtime-credentials";

type ChildRow = {
  id: string;
  nickname: string | null;
  real_name: string | null;
};

type CareTeamRow = {
  child_id: string;
};

export type RoleRuntimeState = {
  loading: boolean;
  warning: string | null;
  isAuthenticated: boolean;
  sessionEmail: string | null;
  accessToken: string | null;
  children: ChildOption[];
  selectedChildId: string | null;
  setSelectedChildId: (childId: string) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

async function fetchRoleChildren(
  client: SupabaseClient,
  userId: string,
  role: OrchestratorRole,
): Promise<ChildOption[]> {
  const teamsResp = await client
    .from("care_teams")
    .select("child_id")
    .eq("user_id", userId)
    .eq("role", role)
    .eq("status", "active");

  if (teamsResp.error) {
    throw new Error(`读取 care_teams 失败：${teamsResp.error.message}`);
  }

  const childIds = Array.from(
    new Set(
      ((teamsResp.data as CareTeamRow[] | null) ?? [])
        .map((row) => row.child_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  if (childIds.length === 0) {
    return [];
  }

  const childrenResp = await client
    .from("children")
    .select("id,nickname,real_name")
    .in("id", childIds);

  if (childrenResp.error) {
    throw new Error(`读取 children 失败：${childrenResp.error.message}`);
  }

  const children = (childrenResp.data as ChildRow[] | null) ?? [];
  return buildChildOptions(children);
}

export function useRoleRuntime(role: OrchestratorRole): RoleRuntimeState {
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setWarning(null);

    if (!client) {
      setWarning("缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY，运行时能力已降级。");
      setIsAuthenticated(false);
      setSessionEmail(null);
      setAccessToken(null);
      setChildren([]);
      setSelectedChildIdState(null);
      setLoading(false);
      return;
    }

    try {
      const manual = readManualRuntimeCredentialsFromWindow();
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw new Error(`读取登录会话失败：${error.message}`);
      }

      const session = data.session;
      const runtimeAccessToken = pickRuntimeAccessToken({
        sessionAccessToken: session?.access_token,
        manualAccessToken: manual.manualAccessToken,
      });

      let roleChildren: ChildOption[] = [];
      if (session?.user.id) {
        try {
          roleChildren = await fetchRoleChildren(client, session.user.id, role);
        } catch (childrenError) {
          setWarning(
            childrenError instanceof Error
              ? childrenError.message
              : "加载孩子列表失败，请稍后重试。",
          );
        }
      }

      const selected =
        resolveSelectedChildId(roleChildren, manual.manualChildId) ?? normalizeManualChildId(manual.manualChildId);

      setIsAuthenticated(Boolean(session));
      setSessionEmail(session?.user.email ?? null);
      setAccessToken(runtimeAccessToken);
      setChildren(roleChildren);
      setSelectedChildIdState(selected);

      if (!runtimeAccessToken) {
        setWarning("未检测到有效访问令牌，请先到 /auth 登录或配置。");
      } else if (!selected) {
        setWarning("未检测到可用 child_id，请先到 /auth 或页面选择器配置。");
      }
    } catch (err) {
      setWarning(err instanceof Error ? err.message : "运行时上下文加载失败。");
      setIsAuthenticated(false);
      setSessionEmail(null);
      setAccessToken(null);
      setChildren([]);
      setSelectedChildIdState(null);
    } finally {
      setLoading(false);
    }
  }, [client, role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!client) return;

    const { data } = client.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [client, refresh]);

  const setSelectedChildId = useCallback((childId: string) => {
    setSelectedChildIdState(childId);
    persistManualChildId(childId);
  }, []);

  const signOut = useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
    await refresh();
  }, [client, refresh]);

  return {
    loading,
    warning,
    isAuthenticated,
    sessionEmail,
    accessToken,
    children,
    selectedChildId,
    setSelectedChildId,
    refresh,
    signOut,
  };
}
