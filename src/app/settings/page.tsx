"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import {
  getCurrentUserProfile,
  saveParentNickname,
  type UserProfileSnapshot,
} from "@/lib/prototype/parent-data-access";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

type SettingsTab = "account" | "preference" | "legal" | "other";
type AiStyle = "简洁" | "详细" | "温暖";

const PREF_KEY = "starpath_parent_preferences_v1";

type ParentPreferences = {
  reminderTime: string;
  aiStyle: AiStyle;
  trainingNotify: boolean;
};

function readPreferences(): ParentPreferences {
  if (typeof window === "undefined") {
    return {
      reminderTime: "20:00",
      aiStyle: "温暖",
      trainingNotify: true,
    };
  }
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) {
      return {
        reminderTime: "20:00",
        aiStyle: "温暖",
        trainingNotify: true,
      };
    }
    const parsed = JSON.parse(raw) as Partial<ParentPreferences>;
    return {
      reminderTime: parsed.reminderTime ?? "20:00",
      aiStyle: parsed.aiStyle ?? "温暖",
      trainingNotify: parsed.trainingNotify ?? true,
    };
  } catch {
    return {
      reminderTime: "20:00",
      aiStyle: "温暖",
      trainingNotify: true,
    };
  }
}

export default function SettingsPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [tab, setTab] = useState<SettingsTab>("account");
  const [profile, setProfile] = useState<UserProfileSnapshot | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [savingNickname, setSavingNickname] = useState(false);

  const [reminderTime, setReminderTime] = useState(() => readPreferences().reminderTime);
  const [aiStyle, setAiStyle] = useState<AiStyle>(() => readPreferences().aiStyle);
  const [trainingNotify, setTrainingNotify] = useState(() => readPreferences().trainingNotify);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

  const blockingReason = !client ? "缺少 Supabase 前端配置，设置页已降级。" : null;

  useEffect(() => {
    if (!client) return;

    const run = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const snapshot = await getCurrentUserProfile(client);
        setProfile(snapshot);
        setNickname(snapshot?.name ?? "");
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : "读取账号信息失败。");
      } finally {
        setProfileLoading(false);
      }
    };

    void run();
  }, [client]);

  const saveNickname = async () => {
    if (!client) {
      setAccountMessage("当前环境未配置 Supabase，无法保存昵称。");
      return;
    }
    try {
      setSavingNickname(true);
      setAccountMessage(null);
      const result = await saveParentNickname(client, nickname);
      setAccountMessage(`昵称已更新：${result.name}`);
      setProfile((prev) => (prev ? { ...prev, name: result.name } : prev));
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : "昵称保存失败。");
    } finally {
      setSavingNickname(false);
    }
  };

  const savePreferences = () => {
    const nextPrefs: ParentPreferences = {
      reminderTime,
      aiStyle,
      trainingNotify,
    };
    window.localStorage.setItem(PREF_KEY, JSON.stringify(nextPrefs));
    setPreferenceMessage("偏好设置已保存。");
  };

  return (
    <ParentShell title="设置" subtitle="账号、偏好与隐私控制" activePath="/settings">
      <section className="proto-panel">
        <div className="proto-chip-row">
          <button type="button" className={tab === "account" ? "chip-button active" : "chip-button"} onClick={() => setTab("account")}>
            账号信息
          </button>
          <button type="button" className={tab === "preference" ? "chip-button active" : "chip-button"} onClick={() => setTab("preference")}>
            偏好设置
          </button>
          <button type="button" className={tab === "legal" ? "chip-button active" : "chip-button"} onClick={() => setTab("legal")}>
            法律信息
          </button>
          <button type="button" className={tab === "other" ? "chip-button active" : "chip-button"} onClick={() => setTab("other")}>
            其他
          </button>
        </div>
      </section>

      {tab === "account" ? (
        <section className="proto-panel">
          <h2>账号信息</h2>
          {profileLoading ? <p className="proto-muted">账号信息加载中...</p> : null}
          {profileError ? <p className="proto-muted">账号读取失败：{profileError}</p> : null}
          {blockingReason ? <p className="proto-muted">{blockingReason}</p> : null}
          <form className="proto-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              昵称
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </label>
            <label>
              手机号
              <input
                value={profile?.phone ?? profile?.sessionPhone ?? "未绑定"}
                disabled
                readOnly
              />
            </label>
            <label>
              登录邮箱
              <input value={profile?.sessionEmail ?? "未绑定"} disabled readOnly />
            </label>
            <button type="button" className="button-primary" onClick={() => void saveNickname()} disabled={savingNickname}>
              {savingNickname ? "保存中..." : "保存昵称"}
            </button>
          </form>
          {accountMessage ? <p className="proto-muted">{accountMessage}</p> : null}
          <ul className="proto-bullets">
            <li>修改昵称</li>
            <li>修改手机号（短信验证码）</li>
          </ul>
        </section>
      ) : null}

      {tab === "preference" ? (
        <section className="proto-panel">
          <h2>偏好设置</h2>
          <form className="proto-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              训练提醒时间
              <input value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
            </label>
            <label>
              AI 回复风格
              <select value={aiStyle} onChange={(event) => setAiStyle(event.target.value as AiStyle)}>
                <option value="简洁">简洁</option>
                <option value="详细">详细</option>
                <option value="温暖">温暖</option>
              </select>
            </label>
            <label>
              训练提醒开关
              <select
                value={trainingNotify ? "on" : "off"}
                onChange={(event) => setTrainingNotify(event.target.value === "on")}
              >
                <option value="on">开启</option>
                <option value="off">关闭</option>
              </select>
            </label>
            <button type="button" className="button-primary" onClick={savePreferences}>
              保存偏好
            </button>
          </form>
          {preferenceMessage ? <p className="proto-muted">{preferenceMessage}</p> : null}
          <ul className="proto-bullets">
            <li>训练提醒时间</li>
            <li>AI 回复风格（简洁 / 详细 / 温暖）</li>
            <li>数据访问权限（按孩子授权）</li>
          </ul>
        </section>
      ) : null}

      {tab === "legal" ? (
        <section className="proto-panel">
          <h2>法律信息</h2>
          <ul className="proto-bullets">
            <li>
              <Link href="/legal/terms" className="button-link">
                用户协议
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="button-link">
                隐私政策
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      {tab === "other" ? (
        <section className="proto-panel">
          <h2>其他</h2>
          <ul className="proto-bullets">
            <li>
              <Link href="/about" className="button-link">
                关于星途
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="button-link">
                意见反馈
              </Link>
            </li>
            <li>
              <Link href="/vip" className="button-link">
                升级 VIP
              </Link>
            </li>
            <li>
              <Link href="/account-close" className="button-link">
                注销账号
              </Link>
            </li>
          </ul>
          <button type="button" className="button-secondary" onClick={() => void runtime.signOut()}>
            退出登录
          </button>
        </section>
      ) : null}
    </ParentShell>
  );
}
