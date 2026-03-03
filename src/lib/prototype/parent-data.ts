export type TrainingSessionLite = {
  session_date: string | null;
  target_skill: string | null;
  duration_minutes: number | null;
  success_rate: number | null;
  notes: string | null;
};

export type TrainingSummary = {
  sessionCount: number;
  trainingDays: number;
  totalMinutes: number;
  averageSuccessRate: number | null;
  averageScore5: number | null;
};

export type TrainingDayGroup = {
  date: string;
  sessions: TrainingSessionLite[];
  totalMinutes: number;
  averageSuccessRate: number | null;
};

export type DomainScoreKey =
  | "language_communication"
  | "social_interaction"
  | "cognition_learning"
  | "sensory_motor"
  | "emotion_behavior"
  | "life_adaptation";

export type DomainScore = {
  key: DomainScoreKey;
  label: string;
  score: number | null;
};

export type TrainingTrendSummary = {
  last30DaysSessions: number;
  last7DaysSessions: number;
  totalMinutes: number;
  averageSuccessRate: number | null;
};

type DomainConfig = {
  key: DomainScoreKey;
  label: string;
  aliases: string[];
};

const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    key: "language_communication",
    label: "语言沟通",
    aliases: ["language_communication", "language", "语言沟通"],
  },
  {
    key: "social_interaction",
    label: "社交互动",
    aliases: ["social_interaction", "social", "社交互动"],
  },
  {
    key: "cognition_learning",
    label: "认知学习",
    aliases: ["cognition_learning", "cognition", "认知学习"],
  },
  {
    key: "sensory_motor",
    label: "感觉运动",
    aliases: ["sensory_motor", "motor", "感觉运动"],
  },
  {
    key: "emotion_behavior",
    label: "情绪行为",
    aliases: ["emotion_behavior", "emotion", "情绪行为"],
  },
  {
    key: "life_adaptation",
    label: "生活适应",
    aliases: ["life_adaptation", "adaptive", "生活适应"],
  },
];

function toOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function toInteger(value: number): number {
  return Math.round(value);
}

function normalizeDate(value: Date | string | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
}

function parseSessionDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function normalizeScore(value: unknown): number | null {
  const direct = asFiniteNumber(value);
  if (direct !== null) {
    return Math.max(0, Math.min(100, toInteger(direct)));
  }

  const record = asRecord(value);
  if (!record) return null;

  for (const field of ["score", "value", "level"]) {
    const next = asFiniteNumber(record[field]);
    if (next !== null) {
      return Math.max(0, Math.min(100, toInteger(next)));
    }
  }

  return null;
}

export function summarizeTrainingSessions(sessions: TrainingSessionLite[]): TrainingSummary {
  const daySet = new Set<string>();
  let totalMinutes = 0;
  let successTotal = 0;
  let successCount = 0;

  for (const session of sessions) {
    if (session.session_date) {
      daySet.add(session.session_date);
    }
    if (typeof session.duration_minutes === "number" && Number.isFinite(session.duration_minutes)) {
      totalMinutes += session.duration_minutes;
    }
    if (typeof session.success_rate === "number" && Number.isFinite(session.success_rate)) {
      successTotal += session.success_rate;
      successCount += 1;
    }
  }

  const averageSuccessRate =
    successCount > 0 ? toInteger(successTotal / successCount) : null;
  const averageScore5 =
    averageSuccessRate !== null ? toOneDecimal(averageSuccessRate / 20) : null;

  return {
    sessionCount: sessions.length,
    trainingDays: daySet.size,
    totalMinutes,
    averageSuccessRate,
    averageScore5,
  };
}

export function groupSessionsByDay(sessions: TrainingSessionLite[]): TrainingDayGroup[] {
  const groupMap = new Map<string, TrainingSessionLite[]>();

  for (const session of sessions) {
    const key = session.session_date ?? "未知日期";
    const existing = groupMap.get(key);
    if (existing) {
      existing.push(session);
      continue;
    }
    groupMap.set(key, [session]);
  }

  return Array.from(groupMap.entries())
    .map(([date, rows]) => {
      let totalMinutes = 0;
      let successTotal = 0;
      let successCount = 0;

      for (const session of rows) {
        if (typeof session.duration_minutes === "number" && Number.isFinite(session.duration_minutes)) {
          totalMinutes += session.duration_minutes;
        }
        if (typeof session.success_rate === "number" && Number.isFinite(session.success_rate)) {
          successTotal += session.success_rate;
          successCount += 1;
        }
      }

      return {
        date,
        sessions: rows,
        totalMinutes,
        averageSuccessRate: successCount > 0 ? toInteger(successTotal / successCount) : null,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function extractDomainScores(domainLevels: unknown): DomainScore[] {
  const record = asRecord(domainLevels) ?? {};

  return DOMAIN_CONFIGS.map((config) => {
    let score: number | null = null;
    for (const alias of config.aliases) {
      if (!(alias in record)) continue;
      score = normalizeScore(record[alias]);
      break;
    }
    return {
      key: config.key,
      label: config.label,
      score,
    };
  });
}

export function summarizeTrainingTrend(
  sessions: TrainingSessionLite[],
  now?: Date | string,
): TrainingTrendSummary {
  const base = normalizeDate(now);
  const start30 = new Date(base);
  start30.setUTCDate(base.getUTCDate() - 29);
  const start7 = new Date(base);
  start7.setUTCDate(base.getUTCDate() - 6);

  let last30DaysSessions = 0;
  let last7DaysSessions = 0;
  let totalMinutes = 0;
  let successTotal = 0;
  let successCount = 0;

  for (const session of sessions) {
    const date = parseSessionDate(session.session_date);
    if (!date) continue;
    if (date > base || date < start30) continue;

    last30DaysSessions += 1;
    if (date >= start7) {
      last7DaysSessions += 1;
    }
    if (typeof session.duration_minutes === "number" && Number.isFinite(session.duration_minutes)) {
      totalMinutes += session.duration_minutes;
    }
    if (typeof session.success_rate === "number" && Number.isFinite(session.success_rate)) {
      successTotal += session.success_rate;
      successCount += 1;
    }
  }

  return {
    last30DaysSessions,
    last7DaysSessions,
    totalMinutes,
    averageSuccessRate: successCount > 0 ? toInteger(successTotal / successCount) : null,
  };
}

type BuildHomeGuideStepsInput = {
  domainScores: DomainScore[];
  riskLevel: string | null;
  last7DaysSessions: number;
};

const DOMAIN_STEP_MAP: Record<DomainScoreKey, string> = {
  language_communication: "语言沟通：双词短句仿说 + 轮流对话练习（10 分钟）",
  social_interaction: "社交互动：轮流游戏 + 主动问候泛化（10 分钟）",
  cognition_learning: "认知学习：分类配对 + 双步骤指令训练（10 分钟）",
  sensory_motor: "感觉运动：平衡与精细动作组合训练（10 分钟）",
  emotion_behavior: "情绪行为：任务切换前预告 + 情绪卡片命名练习（10 分钟）",
  life_adaptation: "生活适应：分步指令完成收纳与洗手流程（8 分钟）",
};

export function buildHomeGuideSteps(input: BuildHomeGuideStepsInput): string[] {
  const steps: string[] = [];

  const weakDomains = input.domainScores
    .filter((item): item is DomainScore & { score: number } => item.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  for (const domain of weakDomains) {
    steps.push(DOMAIN_STEP_MAP[domain.key]);
  }

  if (input.last7DaysSessions < 4) {
    steps.push("训练频次：建议本周至少完成 4 次短时训练（每次 10-15 分钟）");
  } else if (input.riskLevel === "high") {
    steps.push("风险管控：先安抚再任务，单次仅推进 1 个目标并即时强化。");
  } else if (input.riskLevel === "medium") {
    steps.push("泛化提升：在家庭不同场景重复已掌握技能，减少提示依赖。");
  } else {
    steps.push("巩固计划：将已掌握技能延长至 15 分钟连续完成。");
  }

  const fallback = [
    "共同注意：吹泡泡 + 指向跟随（10 分钟）",
    "语言仿说：双词短句练习（8 分钟）",
    "生活适应：独立收纳玩具（6 分钟）",
  ];

  while (steps.length < 3) {
    steps.push(fallback[steps.length]);
  }

  return steps.slice(0, 3);
}
