import { expect, test } from "@playwright/test";

test("teacher training journey", async ({ page }) => {
  await page.goto("/teacher/dashboard");
  await expect(page.getByRole("heading", { name: "教师端看板" })).toBeVisible();
  await expect(page.getByText("本周教学概览")).toBeVisible();

  await page.goto("/teacher/chat");
  await expect(page.getByRole("heading", { name: "教师端对话" })).toBeVisible();
  await page.getByPlaceholder("输入你的问题...").fill("请给我课堂执行建议");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("请给我课堂执行建议")).toBeVisible();
});
