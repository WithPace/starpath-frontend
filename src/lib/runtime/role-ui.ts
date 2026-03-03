import type { OrchestratorRole } from "@/lib/api/orchestrator-client";

export type RoleUiMeta = {
  role: OrchestratorRole;
  label: string;
  shortLabel: string;
  themeClass: string;
  chatPath: string;
  dashboardPath: string;
  journeyPath?: string;
  membersPath?: string;
};

const ROLE_UI_META: Record<OrchestratorRole, RoleUiMeta> = {
  parent: {
    role: "parent",
    label: "家长端",
    shortLabel: "家长",
    themeClass: "theme-parent",
    chatPath: "/chat",
    dashboardPath: "/dashboard",
    journeyPath: "/journey",
  },
  doctor: {
    role: "doctor",
    label: "医生端",
    shortLabel: "医生",
    themeClass: "theme-doctor",
    chatPath: "/doctor/chat",
    dashboardPath: "/doctor/dashboard",
  },
  teacher: {
    role: "teacher",
    label: "特教老师端",
    shortLabel: "特教老师",
    themeClass: "theme-teacher",
    chatPath: "/teacher/chat",
    dashboardPath: "/teacher/dashboard",
  },
  org_admin: {
    role: "org_admin",
    label: "机构管理端",
    shortLabel: "机构管理员",
    themeClass: "theme-org",
    chatPath: "/org-admin/dashboard",
    dashboardPath: "/org-admin/dashboard",
    membersPath: "/org-admin/members",
  },
};

export function getRoleUiMeta(role: OrchestratorRole): RoleUiMeta {
  return ROLE_UI_META[role];
}

export function getRoleLaunchItems(): Array<{
  title: string;
  description: string;
  actions: Array<{ label: string; href: string }>;
}> {
  return [
    {
      title: "家长端",
      description: "接收评估解读、训练建议和每日跟进。",
      actions: [
        { label: "家长端 · 对话", href: ROLE_UI_META.parent.chatPath },
        { label: "家长端 · 看板", href: ROLE_UI_META.parent.dashboardPath },
        { label: "家长端 · 业务链路", href: ROLE_UI_META.parent.journeyPath ?? "/journey" },
      ],
    },
    {
      title: "医生端",
      description: "查看风险变化并给出复诊与干预建议。",
      actions: [
        { label: "医生端 · 对话", href: ROLE_UI_META.doctor.chatPath },
        { label: "医生端 · 看板", href: ROLE_UI_META.doctor.dashboardPath },
      ],
    },
    {
      title: "特教老师端",
      description: "同步课堂训练反馈并回写训练记录。",
      actions: [
        { label: "特教老师端 · 对话", href: ROLE_UI_META.teacher.chatPath },
        { label: "特教老师端 · 看板", href: ROLE_UI_META.teacher.dashboardPath },
      ],
    },
    {
      title: "机构管理端",
      description: "查看机构运行概览并管理成员权限状态。",
      actions: [
        { label: "机构管理端 · 看板", href: ROLE_UI_META.org_admin.dashboardPath },
        { label: "机构成员管理", href: ROLE_UI_META.org_admin.membersPath ?? "/org-admin/members" },
      ],
    },
  ];
}
