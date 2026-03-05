import { expect, test } from "@playwright/test";

test("role dashboards render business panels", async ({ page }) => {
  await page.goto("/auth");
  await page.getByLabel("Access Token").fill("manual-token-role-dashboard");
  await page.getByLabel("Child ID").fill("manual-child-role-dashboard");
  await page.getByRole("button", { name: "保存手动配置" }).click();
  await expect(page.getByText("手动运行时配置已保存。")).toBeVisible();

  await page.goto("/doctor/dashboard");
  await expect(page).toHaveURL(/\/doctor\/dashboard$/);
  await expect(page.getByRole("heading", { name: "风险分诊待办" })).toBeVisible();

  await page.goto("/teacher/dashboard");
  await expect(page).toHaveURL(/\/teacher\/dashboard$/);
  await expect(page.getByRole("heading", { name: "课堂执行清单" })).toBeVisible();

  await page.goto("/org-admin/dashboard");
  await expect(page).toHaveURL(/\/org-admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "机构运营快照" })).toBeVisible();
});
