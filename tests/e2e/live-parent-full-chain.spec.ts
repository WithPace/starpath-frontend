import { expect, test } from "@playwright/test";

import { resolveChatSendWaitState } from "@/lib/runtime/chat-send-state";
import { assertLiveE2EConfig, getLiveE2EConfig } from "@/lib/runtime/live-e2e-config";
import { resolveOtpLoginWaitState } from "@/lib/runtime/otp-login-state";

const liveConfig = getLiveE2EConfig();

test.describe("@live parent full chain", () => {
  test.describe.configure({ timeout: 180_000 });
  test.skip(!liveConfig.enabled, "RUN_E2E_LIVE != 1, skip live suite");

  test("parent can sign in and complete chat/dashboard flow against live backend", async ({ page }) => {
    const config = assertLiveE2EConfig();
    const nickname = `${config.parentNickname}-${Date.now().toString().slice(-4)}`;

    await page.goto("/auth");

    if (config.accessToken) {
      await page.getByLabel("Access Token").fill(config.accessToken);
      await page.getByLabel("Child ID").fill(config.parentChildId ?? "");
      await page.getByRole("button", { name: "保存手动配置" }).click();
      await expect(page.getByText("手动运行时配置已保存。")).toBeVisible();
    } else {
      await page.getByLabel("手机号").fill(config.phone ?? "");
      if (config.triggerOtpSend) {
        await page.getByRole("button", { name: "发送验证码" }).click();
      }
      await page.getByLabel("验证码").fill(config.otp ?? "");
      await page.getByRole("button", { name: "验证码登录" }).click();
      await expect
        .poll(
          async () => {
            const sessionStatusLocator = page.getByText("当前会话：").first();
            const sessionStatusText =
              (await sessionStatusLocator.count()) > 0 ? await sessionStatusLocator.textContent() : null;
            const otpErrorLocator = page.locator("p").filter({ hasText: /^验证码登录失败：/ }).first();
            const otpErrorText = (await otpErrorLocator.count()) > 0 ? await otpErrorLocator.textContent() : null;

            return resolveOtpLoginWaitState({
              currentUrl: page.url(),
              sessionStatusText,
              otpErrorText,
            });
          },
          { timeout: 12_000, message: "waiting for otp login result" },
        )
        .toBe("ok");

      if (new URL(page.url()).pathname === "/auth") {
        await page.getByLabel("Child ID").fill(config.parentChildId ?? "");
        await page.getByRole("button", { name: "保存手动配置" }).click();
      }
    }

    await page.goto("/chat");
    await expect(page).toHaveURL(/\/chat$/);
    await expect(page.getByRole("heading", { name: "家长端对话" })).toBeVisible();

    await page.getByLabel("chat-input").fill(config.chatMessage);
    await page.getByRole("button", { name: "发送" }).click();

    await expect(page.getByText(config.chatMessage)).toBeVisible();
    await expect
      .poll(
        async () => {
          const sendButtonDisabled = await page.getByRole("button", { name: "发送" }).isDisabled();
          const requestFailureLocator = page.getByText("请求失败：");
          const requestFailureText =
            (await requestFailureLocator.count()) > 0 ? await requestFailureLocator.first().textContent() : null;

          return resolveChatSendWaitState({
            sendButtonDisabled,
            requestFailureText,
          });
        },
        { timeout: 90_000, message: "waiting for chat send completion" },
      )
      .toBe("ok");

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "家长端看板" })).toBeVisible();

    const cards = page.locator("section[aria-label='dashboard-cards'] article");
    await expect(cards.first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("看板加载失败：")).toHaveCount(0);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: "设置" })).toBeVisible();
    await page.getByLabel("昵称").fill(nickname);
    await page.getByRole("button", { name: "保存昵称" }).click();
    if (config.accessToken) {
      await expect(page.getByText("请先登录后再修改昵称。")).toBeVisible({ timeout: 20_000 });
    } else {
      await expect(page.getByText(`昵称已更新：${nickname}`)).toBeVisible({ timeout: 20_000 });
    }

    await page.goto("/home-guide");
    await expect(page).toHaveURL(/\/home-guide$/);
    await expect(page.getByRole("heading", { name: "居家指导" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "今日执行重点（动态）" })).toBeVisible();
    await expect(page.getByText("指导降级：")).toHaveCount(0);

    await page.goto("/card-fullscreen");
    await expect(page).toHaveURL(/\/card-fullscreen$/);
    await expect(page.getByRole("heading", { name: "卡片全屏" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "近30天训练概览" })).toBeVisible();
    await page.getByRole("button", { name: "能力画像" }).click();
    await expect(page.getByRole("heading", { name: "六领域能力画像（动态）" })).toBeVisible();
    await page.getByRole("button", { name: "评估报告" }).click();
    await expect(page.getByRole("heading", { name: "最近评估记录（动态）" })).toBeVisible();
    await expect(page.getByText("卡片降级：")).toHaveCount(0);
  });
});
