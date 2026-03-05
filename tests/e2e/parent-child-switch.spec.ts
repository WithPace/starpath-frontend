import { expect, test } from "@playwright/test";

const RUNTIME_ACCESS_TOKEN_KEY = "sp_access_token";
const RUNTIME_CHILD_ID_KEY = "sp_child_id";

test("@exception parent child switch remains consistent across chat and dashboard", async ({ page }) => {
  const token = "manual-token-for-e2e";
  const childA = "child-e2e-a";
  const childB = "child-e2e-b";

  await page.goto("/auth");
  await page.getByLabel("Access Token").fill(token);
  await page.getByLabel("Child ID").fill(childA);
  await page.getByRole("button", { name: "保存手动配置" }).click();
  await expect(page.getByText("手动运行时配置已保存。")).toBeVisible();

  await page.goto("/chat");
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole("heading", { name: "家长端对话" })).toBeVisible();
  await expect
    .poll(async () => {
      return page.evaluate(
        ([tokenKey, childKey]) => ({
          token: window.localStorage.getItem(tokenKey),
          childId: window.localStorage.getItem(childKey),
        }),
        [RUNTIME_ACCESS_TOKEN_KEY, RUNTIME_CHILD_ID_KEY],
      );
    })
    .toEqual({ token, childId: childA });

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "家长端看板" })).toBeVisible();
  await expect
    .poll(async () => {
      return page.evaluate(
        ([tokenKey, childKey]) => ({
          token: window.localStorage.getItem(tokenKey),
          childId: window.localStorage.getItem(childKey),
        }),
        [RUNTIME_ACCESS_TOKEN_KEY, RUNTIME_CHILD_ID_KEY],
      );
    })
    .toEqual({ token, childId: childA });

  await page.goto("/auth");
  await page.getByLabel("Access Token").fill(token);
  await page.getByLabel("Child ID").fill(childB);
  await page.getByRole("button", { name: "保存手动配置" }).click();
  await expect(page.getByText("手动运行时配置已保存。")).toBeVisible();

  await page.goto("/chat");
  await expect(page).toHaveURL(/\/chat$/);
  await expect
    .poll(async () => {
      return page.evaluate(
        ([tokenKey, childKey]) => ({
          token: window.localStorage.getItem(tokenKey),
          childId: window.localStorage.getItem(childKey),
        }),
        [RUNTIME_ACCESS_TOKEN_KEY, RUNTIME_CHILD_ID_KEY],
      );
    })
    .toEqual({ token, childId: childB });

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect
    .poll(async () => {
      return page.evaluate(
        ([tokenKey, childKey]) => ({
          token: window.localStorage.getItem(tokenKey),
          childId: window.localStorage.getItem(childKey),
        }),
        [RUNTIME_ACCESS_TOKEN_KEY, RUNTIME_CHILD_ID_KEY],
      );
    })
    .toEqual({ token, childId: childB });
});
