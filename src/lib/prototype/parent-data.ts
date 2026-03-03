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
