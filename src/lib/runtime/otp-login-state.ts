export type OtpLoginWaitStateInput = {
  currentUrl: string;
  sessionStatusText: string | null;
  otpErrorText: string | null;
};

function toPathname(currentUrl: string): string {
  try {
    return new URL(currentUrl, "http://127.0.0.1").pathname;
  } catch {
    const index = currentUrl.indexOf("?");
    return index >= 0 ? currentUrl.slice(0, index) : currentUrl;
  }
}

export function resolveOtpLoginWaitState(input: OtpLoginWaitStateInput): string {
  const pathname = toPathname(input.currentUrl);
  if (pathname !== "/auth") {
    return "ok";
  }

  if (input.sessionStatusText && !input.sessionStatusText.includes("未登录")) {
    return "ok";
  }

  if (input.otpErrorText) {
    return input.otpErrorText;
  }

  return "pending";
}
