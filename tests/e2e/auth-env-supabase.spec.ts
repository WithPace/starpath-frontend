import { expect, test } from "@playwright/test";

test("auth page should not report missing supabase env when NEXT_PUBLIC vars exist", async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_* not configured",
  );

  await page.goto("/auth");

  await expect(
    page.getByText("当前环境未配置 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。"),
  ).toHaveCount(0);
});
