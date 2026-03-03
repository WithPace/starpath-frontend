import { describe, expect, it } from "vitest";

import {
  buildHomeGuideSteps,
  extractDomainScores,
  groupSessionsByDay,
  summarizeTrainingTrend,
  summarizeTrainingSessions,
  type TrainingSessionLite,
} from "./parent-data";

describe("summarizeTrainingSessions", () => {
  it("aggregates counts, minutes, success rate and score", () => {
    const sessions: TrainingSessionLite[] = [
      {
        session_date: "2026-03-03",
        target_skill: "共同注意",
        duration_minutes: 20,
        success_rate: 80,
        notes: null,
      },
      {
        session_date: "2026-03-02",
        target_skill: "情绪识别",
        duration_minutes: 15,
        success_rate: 60,
        notes: null,
      },
      {
        session_date: "2026-03-03",
        target_skill: "生活自理",
        duration_minutes: null,
        success_rate: null,
        notes: null,
      },
    ];

    expect(summarizeTrainingSessions(sessions)).toEqual({
      sessionCount: 3,
      trainingDays: 2,
      totalMinutes: 35,
      averageSuccessRate: 70,
      averageScore5: 3.5,
    });
  });
});

describe("groupSessionsByDay", () => {
  it("groups by session_date and sorts from latest day to oldest day", () => {
    const sessions: TrainingSessionLite[] = [
      {
        session_date: "2026-03-01",
        target_skill: "A",
        duration_minutes: 10,
        success_rate: 50,
        notes: null,
      },
      {
        session_date: "2026-03-03",
        target_skill: "B",
        duration_minutes: 20,
        success_rate: 80,
        notes: null,
      },
      {
        session_date: "2026-03-01",
        target_skill: "C",
        duration_minutes: 15,
        success_rate: 70,
        notes: null,
      },
    ];

    expect(groupSessionsByDay(sessions)).toEqual([
      {
        date: "2026-03-03",
        sessions: [
          {
            session_date: "2026-03-03",
            target_skill: "B",
            duration_minutes: 20,
            success_rate: 80,
            notes: null,
          },
        ],
        totalMinutes: 20,
        averageSuccessRate: 80,
      },
      {
        date: "2026-03-01",
        sessions: [
          {
            session_date: "2026-03-01",
            target_skill: "A",
            duration_minutes: 10,
            success_rate: 50,
            notes: null,
          },
          {
            session_date: "2026-03-01",
            target_skill: "C",
            duration_minutes: 15,
            success_rate: 70,
            notes: null,
          },
        ],
        totalMinutes: 25,
        averageSuccessRate: 60,
      },
    ]);
  });
});

describe("extractDomainScores", () => {
  it("maps mixed key styles and value shapes into six domain scores", () => {
    const domainLevels = {
      language_communication: 74,
      社交互动: { score: "68" },
      cognition: { value: 70 },
      感觉运动: "82",
      emotion_behavior: { level: 55 },
      adaptive: null,
    };

    expect(extractDomainScores(domainLevels)).toEqual([
      { key: "language_communication", label: "语言沟通", score: 74 },
      { key: "social_interaction", label: "社交互动", score: 68 },
      { key: "cognition_learning", label: "认知学习", score: 70 },
      { key: "sensory_motor", label: "感觉运动", score: 82 },
      { key: "emotion_behavior", label: "情绪行为", score: 55 },
      { key: "life_adaptation", label: "生活适应", score: null },
    ]);
  });
});

describe("summarizeTrainingTrend", () => {
  it("builds 30-day and 7-day trend summary", () => {
    const sessions: TrainingSessionLite[] = [
      {
        session_date: "2026-03-02",
        target_skill: "共同注意",
        duration_minutes: 20,
        success_rate: 80,
        notes: null,
      },
      {
        session_date: "2026-03-01",
        target_skill: "情绪识别",
        duration_minutes: 10,
        success_rate: 60,
        notes: null,
      },
      {
        session_date: "2026-02-10",
        target_skill: "生活适应",
        duration_minutes: 15,
        success_rate: 70,
        notes: null,
      },
    ];

    expect(summarizeTrainingTrend(sessions, "2026-03-03T00:00:00.000Z")).toEqual({
      last30DaysSessions: 3,
      last7DaysSessions: 2,
      totalMinutes: 45,
      averageSuccessRate: 70,
    });
  });
});

describe("buildHomeGuideSteps", () => {
  it("returns risk-aware and weakness-aware three steps", () => {
    const steps = buildHomeGuideSteps({
      domainScores: [
        { key: "language_communication", label: "语言沟通", score: 74 },
        { key: "social_interaction", label: "社交互动", score: 68 },
        { key: "cognition_learning", label: "认知学习", score: 70 },
        { key: "sensory_motor", label: "感觉运动", score: 82 },
        { key: "emotion_behavior", label: "情绪行为", score: 45 },
        { key: "life_adaptation", label: "生活适应", score: 50 },
      ],
      riskLevel: "high",
      last7DaysSessions: 2,
    });

    expect(steps).toEqual([
      "情绪行为：任务切换前预告 + 情绪卡片命名练习（10 分钟）",
      "生活适应：分步指令完成收纳与洗手流程（8 分钟）",
      "训练频次：建议本周至少完成 4 次短时训练（每次 10-15 分钟）",
    ]);
  });
});
