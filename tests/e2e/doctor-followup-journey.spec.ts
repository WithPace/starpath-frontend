import { expect, test } from "@playwright/test";

test("doctor follow-up journey", async ({ page }) => {
  await page.goto("/doctor/dashboard");
  await expect(page.getByRole("heading", { name: "医生端看板" })).toBeVisible();
  await expect(page.getByText("看板加载失败：请先完成登录并选择孩子，再加载看板。", { exact: false })).toBeVisible();

  await page.goto("/doctor/chat");
  await expect(page.getByRole("heading", { name: "医生端对话" })).toBeVisible();
  await page.getByPlaceholder("输入你的问题...").fill("请给我本周随访建议");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("请给我本周随访建议")).toBeVisible();
});
