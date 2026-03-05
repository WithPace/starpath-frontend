import { expect, test } from "@playwright/test";

test("@exception parent sync center can retry failed tasks to success", async ({ page }) => {
  await page.goto("/sync-center");

  await expect(page.getByRole("heading", { name: "同步中心", level: 2 })).toBeVisible();
  await expect(page.getByText("失败", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "重试失败任务" }).click();

  await expect(page.getByText("失败任务已重试并恢复。")).toBeVisible();
  await expect(page.getByText("重试成功，已完成同步")).toBeVisible();
});
