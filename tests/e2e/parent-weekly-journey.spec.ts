import { expect, test } from "@playwright/test";

test("parent weekly journey route requires auth", async ({ page }) => {
  await page.goto("/chat");

  await expect(page).toHaveURL(/\/auth\?next=%2Fchat/);
  await expect(page.getByRole("heading", { name: "认证与运行时配置" })).toBeVisible();
});
