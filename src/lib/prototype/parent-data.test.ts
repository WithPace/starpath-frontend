import { describe, expect, it } from "vitest";

import {
  extractDomainScores,
  groupSessionsByDay,
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
