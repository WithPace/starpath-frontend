import { expect, test } from "@playwright/test";

test("teacher routes require auth", async ({ page }) => {
  await page.goto("/teacher/dashboard");

  await expect(page).toHaveURL(/\/auth\?next=%2Fteacher%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();

  await page.goto("/teacher/chat");
  await expect(page).toHaveURL(/\/auth\?next=%2Fteacher%2Fchat/);
});
