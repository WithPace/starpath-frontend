import { expect, test } from "@playwright/test";

import { assertLiveE2EConfig, getLiveE2EConfig } from "@/lib/runtime/live-e2e-config";

const liveConfig = getLiveE2EConfig();

test.describe("@live parent full chain", () => {
  test.skip(!liveConfig.enabled, "RUN_E2E_LIVE != 1, skip live suite");

  test("parent can sign in and complete chat/dashboard flow against live backend", async ({ page }) => {
    const config = assertLiveE2EConfig();

    await page.goto("/auth");

    await page.getByLabel("Email").fill(config.email ?? "");
    await page.getByLabel("Password").fill(config.password ?? "");
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page.getByText("当前会话：")).toContainText(config.email ?? "");

    await page.getByLabel("Child ID").fill(config.parentChildId ?? "");
    await page.getByRole("button", { name: "保存手动配置" }).click();

    await page.goto("/chat");
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByRole("heading", { name: "家长端对话" })).toBeVisible();

    await page.getByLabel("chat-input").fill(config.chatMessage);
    await page.getByRole("button", { name: "发送" }).click();

    await expect(page.getByText(config.chatMessage)).toBeVisible();
    await expect(page.getByRole("button", { name: "发送" })).toBeEnabled({ timeout: 20_000 });
    await expect(page.getByText("请求失败：")).toHaveCount(0);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "家长端看板" })).toBeVisible();

    const cards = page.locator("section[aria-label='dashboard-cards'] article");
    await expect(cards.first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("看板加载失败：")).toHaveCount(0);
  });
});
