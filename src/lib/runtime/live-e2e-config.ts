type EnvInput = Record<string, string | undefined>;

type LiveE2EConfig = {
  enabled: boolean;
  missing: string[];
  phone: string | null;
  otp: string | null;
  accessToken: string | null;
  parentChildId: string | null;
  chatMessage: string;
  parentNickname: string;
  triggerOtpSend: boolean;
};

function normalize(value: string | undefined): string {
  return (value ?? "").trim();
}

function normalizeBoolean(value: string | undefined): boolean {
  return normalize(value) === "1";
}

export function getLiveE2EConfig(env: EnvInput = process.env): LiveE2EConfig {
  const enabled = normalize(env.RUN_E2E_LIVE) === "1";
  if (!enabled) {
    return {
      enabled: false,
      missing: [],
      phone: null,
      otp: null,
      accessToken: null,
      parentChildId: null,
      chatMessage: "请基于当前孩子情况给出今天可执行的训练建议。",
      parentNickname: "星途家长-自动化",
      triggerOtpSend: false,
    };
  }

  const accessToken = normalize(env.E2E_LIVE_ACCESS_TOKEN);
  const missing: string[] = [];
  if (!normalize(env.E2E_LIVE_PARENT_CHILD_ID)) {
    missing.push("E2E_LIVE_PARENT_CHILD_ID");
  }
  if (!accessToken) {
    if (!normalize(env.E2E_LIVE_PHONE)) {
      missing.push("E2E_LIVE_PHONE");
    }
    if (!normalize(env.E2E_LIVE_OTP)) {
      missing.push("E2E_LIVE_OTP");
    }
  }

  return {
    enabled: true,
    missing,
    phone: normalize(env.E2E_LIVE_PHONE) || null,
    otp: normalize(env.E2E_LIVE_OTP) || null,
    accessToken: accessToken || null,
    parentChildId: normalize(env.E2E_LIVE_PARENT_CHILD_ID) || null,
    chatMessage: normalize(env.E2E_LIVE_CHAT_MESSAGE) || "请基于当前孩子情况给出今天可执行的训练建议。",
    parentNickname: normalize(env.E2E_LIVE_PARENT_NICKNAME) || "星途家长-自动化",
    triggerOtpSend: normalizeBoolean(env.E2E_LIVE_TRIGGER_OTP_SEND),
  };
}

export function assertLiveE2EConfig(env: EnvInput = process.env): LiveE2EConfig {
  const config = getLiveE2EConfig(env);
  if (!config.enabled) {
    throw new Error("RUN_E2E_LIVE must be 1 to run live e2e.");
  }
  if (config.missing.length > 0) {
    throw new Error(`missing live e2e env keys: ${config.missing.join(", ")}`);
  }
  return config;
}
