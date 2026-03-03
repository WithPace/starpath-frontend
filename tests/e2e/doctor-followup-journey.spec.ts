import { expect, test } from "@playwright/test";

test("doctor routes require auth", async ({ page }) => {
  await page.goto("/doctor/dashboard");

  await expect(page).toHaveURL(/\/auth\?next=%2Fdoctor%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();

  await page.goto("/doctor/chat");
  await expect(page).toHaveURL(/\/auth\?next=%2Fdoctor%2Fchat/);
});
