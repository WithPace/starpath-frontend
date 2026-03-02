import { expect, test } from "@playwright/test";

test("parent dashboard follow-up", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "家长端看板" })).toBeVisible();

  await expect(page.getByText("本周训练概览")).toBeVisible();
  await expect(page.getByText("最新评估风险")).toBeVisible();
});
