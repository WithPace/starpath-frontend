import { expect, test } from "@playwright/test";

test("auth page should not report missing supabase env when NEXT_PUBLIC vars exist", async ({ page }) => {
  await page.goto("/auth");

  await expect(
    page.getByText("当前环境未配置 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。"),
  ).toHaveCount(0);
});
