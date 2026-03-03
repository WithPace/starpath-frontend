import { expect, test } from "@playwright/test";

test("parent dashboard route requires auth", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();
});
