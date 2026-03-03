import { expect, test } from "@playwright/test";

test("org admin routes require auth", async ({ page }) => {
  await page.goto("/org-admin/dashboard");

  await expect(page).toHaveURL(/\/auth\?next=%2Forg-admin%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();

  await page.goto("/org-admin/members");
  await expect(page).toHaveURL(/\/auth\?next=%2Forg-admin%2Fmembers/);
});
