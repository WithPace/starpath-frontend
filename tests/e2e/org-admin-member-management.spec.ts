import { expect, test } from "@playwright/test";

test("org admin member management journey", async ({ page }) => {
  await page.goto("/org-admin/dashboard");
  await expect(page.getByRole("heading", { name: "机构管理端看板" })).toBeVisible();
  await expect(page.getByText("看板加载失败：请先完成登录并选择孩子，再加载看板。", { exact: false })).toBeVisible();

  await page.goto("/org-admin/members");
  await expect(page.getByRole("heading", { name: "机构成员管理" })).toBeVisible();
  await expect(page.getByText("成员列表")).toBeVisible();
});
