import { expect, test } from "@playwright/test";

test("parent journey route requires auth", async ({ page }) => {
  await page.goto("/journey");

  await expect(page).toHaveURL(/\/auth\?next=%2Fjourney/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();
});
