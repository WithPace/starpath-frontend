type EnvInput = Record<string, string | undefined>;

type LiveE2EConfig = {
  enabled: boolean;
  missing: string[];
  email: string | null;
  password: string | null;
  parentChildId: string | null;
  chatMessage: string;
};

const REQUIRED_KEYS = [
  "E2E_LIVE_EMAIL",
  "E2E_LIVE_PASSWORD",
  "E2E_LIVE_PARENT_CHILD_ID",
] as const;

function normalize(value: string | undefined): string {
  return (value ?? "").trim();
}

export function getLiveE2EConfig(env: EnvInput = process.env): LiveE2EConfig {
  const enabled = normalize(env.RUN_E2E_LIVE) === "1";
  if (!enabled) {
    return {
      enabled: false,
      missing: [],
      email: null,
      password: null,
      parentChildId: null,
      chatMessage: "请基于当前孩子情况给出今天可执行的训练建议。",
    };
  }

  const missing: string[] = [];
  for (const key of REQUIRED_KEYS) {
    if (!normalize(env[key])) {
      missing.push(key);
    }
  }

  return {
    enabled: true,
    missing,
    email: normalize(env.E2E_LIVE_EMAIL) || null,
    password: normalize(env.E2E_LIVE_PASSWORD) || null,
    parentChildId: normalize(env.E2E_LIVE_PARENT_CHILD_ID) || null,
    chatMessage: normalize(env.E2E_LIVE_CHAT_MESSAGE) || "请基于当前孩子情况给出今天可执行的训练建议。",
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
