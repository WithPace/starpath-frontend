import { expect, test } from "@playwright/test";

test("parent dashboard follow-up", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "家长端看板" })).toBeVisible();
  await expect(page.getByText("看板加载失败：请先完成登录并选择孩子，再加载看板。", { exact: false })).toBeVisible();
});
