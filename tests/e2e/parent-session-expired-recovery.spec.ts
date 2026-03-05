import { expect, test } from "@playwright/test";

test("@exception parent session-expired page can recover back to auth", async ({ page }) => {
  await page.goto("/auth/session-expired?next=%2Fdashboard");

  await expect(page.getByRole("heading", { name: "会话已过期" })).toBeVisible();
  await page.getByRole("button", { name: "重新登录" }).click();

  await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();
});
