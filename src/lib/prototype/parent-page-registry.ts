export type ParentPrototypePage = {
  id: string;
  name: string;
  path: string;
};

export const PARENT_PROTOTYPE_PAGES: ParentPrototypePage[] = [
  { id: "00", name: "欢迎页", path: "/welcome" },
  { id: "01", name: "登录页", path: "/auth" },
  { id: "02", name: "对话页", path: "/chat" },
  { id: "03", name: "快捷菜单", path: "/quick-menu" },
  { id: "04", name: "设置页", path: "/settings" },
  { id: "05", name: "创建孩子", path: "/create-child" },
  { id: "06", name: "卡片全屏", path: "/card-fullscreen" },
  { id: "07", name: "评估页", path: "/assessment" },
  { id: "08", name: "居家指导", path: "/home-guide" },
  { id: "09", name: "语音记录", path: "/voice-record" },
  { id: "10", name: "训练周报", path: "/training-weekly" },
  { id: "11", name: "分析报告", path: "/analysis-report" },
  { id: "12", name: "训练详情", path: "/training-detail" },
];
