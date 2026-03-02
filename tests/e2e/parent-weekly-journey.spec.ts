import { expect, test } from "@playwright/test";

test("parent weekly journey chat flow", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByRole("heading", { name: "家长端对话" })).toBeVisible();

  await page.getByPlaceholder("输入你的问题...").fill("请给我本周训练安排");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText("请给我本周训练安排")).toBeVisible();
});
