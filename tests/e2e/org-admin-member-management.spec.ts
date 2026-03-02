import { expect, test } from "@playwright/test";

test("org admin member management journey", async ({ page }) => {
  await page.goto("/org-admin/dashboard");
  await expect(page.getByRole("heading", { name: "机构管理端看板" })).toBeVisible();
  await expect(page.getByText("本周机构概览")).toBeVisible();

  await page.goto("/org-admin/members");
  await expect(page.getByRole("heading", { name: "机构成员管理" })).toBeVisible();
  await expect(page.getByText("成员列表")).toBeVisible();
});
