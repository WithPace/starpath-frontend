import { expect, test } from "@playwright/test";

test("parent can complete assessment then continue to training-advice and home-guide", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("Access Token").fill("manual-token-parent-chain");
  await page.getByLabel("Child ID").fill("manual-child-parent-chain");
  await page.getByRole("button", { name: "保存手动配置" }).click();
  await expect(page.getByText("手动运行时配置已保存。")).toBeVisible();

  await page.goto("/assessment");
  await expect(page).toHaveURL(/\/assessment$/);
  await expect(page.getByRole("heading", { name: "M-CHAT 筛查" })).toBeVisible();

  await page.getByRole("button", { name: "是" }).click();
  await page.getByRole("button", { name: "否" }).click();
  await page.getByRole("button", { name: "偶尔" }).click();
  await expect(page.getByRole("link", { name: "进入训练建议" })).toBeVisible();

  await page.getByRole("link", { name: "进入训练建议" }).click();
  await expect(page).toHaveURL(/\/training-advice$/);
  await expect(page.getByRole("heading", { name: "训练建议", level: 2 })).toBeVisible();

  await page.getByRole("link", { name: "进入居家指导" }).click();
  await expect(page).toHaveURL(/\/home-guide$/);
  await expect(page.getByRole("heading", { name: "居家指导" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "今日执行重点（动态）" })).toBeVisible();
});
