import { expect, test } from "@playwright/test";

test("role chat routes render business execution panels", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("Access Token").fill("manual-token-role-chat");
  await page.getByLabel("Child ID").fill("manual-child-role-chat");
  await page.getByRole("button", { name: "保存手动配置" }).click();
  await expect(page.getByText("手动运行时配置已保存。")).toBeVisible();

  await page.goto("/doctor/chat");
  await expect(page).toHaveURL(/\/doctor\/chat$/);
  await expect(page.getByRole("heading", { name: "医生对话执行重点" })).toBeVisible();

  await page.goto("/teacher/chat");
  await expect(page).toHaveURL(/\/teacher\/chat$/);
  await expect(page.getByRole("heading", { name: "教师对话执行重点" })).toBeVisible();
});
