export const OTP_RESEND_SECONDS = 60;

export function buildOtpResendCooldownUntilMs(
  nowMs: number = Date.now(),
  cooldownSeconds: number = OTP_RESEND_SECONDS,
): number {
  return nowMs + cooldownSeconds * 1000;
}

export function getOtpResendRemainingSeconds(
  cooldownUntilMs: number | null,
  nowMs: number = Date.now(),
): number {
  if (!cooldownUntilMs) return 0;
  const diffMs = cooldownUntilMs - nowMs;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 1000);
}
