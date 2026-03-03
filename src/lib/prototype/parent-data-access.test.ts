import { describe, expect, it, vi } from "vitest";

import {
  createChildProfileWithGateway,
  saveParentNicknameWithGateway,
  saveAssessmentWithGateway,
  saveVoiceRecordWithGateway,
  summarizeAssessmentAnswers,
  type CreateChildGateway,
  type CreateChildInput,
  type SaveParentNicknameGateway,
  type SaveAssessmentGateway,
  type SaveVoiceGateway,
} from "./parent-data-access";

function buildInput(overrides?: Partial<CreateChildInput>): CreateChildInput {
  return {
    nickname: " 乐乐 ",
    age: "5",
    diagnosisLevel: "中度",
    ...overrides,
  };
}

function buildGateway(overrides?: Partial<CreateChildGateway>): CreateChildGateway {
  return {
    getSessionUser: vi.fn(async () => ({ id: "user-1", phone: "13800000000", name: "家长A" })),
    upsertUser: vi.fn(async () => {}),
    insertChild: vi.fn(async () => ({ id: "child-1" })),
    upsertParentCareTeam: vi.fn(async () => {}),
    insertMedical: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("createChildProfileWithGateway", () => {
  it("throws explicit auth error when session user is missing", async () => {
    const gateway = buildGateway({
      getSessionUser: vi.fn(async () => null),
    });

    await expect(
      createChildProfileWithGateway(gateway, buildInput(), { now: "2026-03-03T00:00:00.000Z" }),
    ).rejects.toThrow("请先登录后再创建孩子档案。");

    expect(gateway.upsertUser).not.toHaveBeenCalled();
    expect(gateway.insertChild).not.toHaveBeenCalled();
    expect(gateway.upsertParentCareTeam).not.toHaveBeenCalled();
  });

  it("runs full write chain and returns child id on success", async () => {
    const gateway = buildGateway();

    const result = await createChildProfileWithGateway(gateway, buildInput(), {
      now: "2026-03-03T00:00:00.000Z",
    });

    expect(gateway.upsertUser).toHaveBeenCalledWith({
      id: "user-1",
      phone: "13800000000",
      name: "家长A",
    });
    expect(gateway.insertChild).toHaveBeenCalledWith({
      nickname: "乐乐",
      createdBy: "user-1",
      birthDate: "2021-03-03",
    });
    expect(gateway.upsertParentCareTeam).toHaveBeenCalledWith({
      userId: "user-1",
      childId: "child-1",
    });
    expect(gateway.insertMedical).toHaveBeenCalledWith({
      childId: "child-1",
      diagnosisLevel: "中度",
    });
    expect(result).toEqual({ childId: "child-1", warnings: [] });
  });

  it("fails fast when child insertion fails and skips downstream writes", async () => {
    const gateway = buildGateway({
      insertChild: vi.fn(async () => {
        throw new Error("insert children failed");
      }),
    });

    await expect(
      createChildProfileWithGateway(gateway, buildInput(), { now: "2026-03-03T00:00:00.000Z" }),
    ).rejects.toThrow("insert children failed");

    expect(gateway.upsertParentCareTeam).not.toHaveBeenCalled();
    expect(gateway.insertMedical).not.toHaveBeenCalled();
  });
});

function buildAssessmentGateway(overrides?: Partial<SaveAssessmentGateway>): SaveAssessmentGateway {
  return {
    insertAssessment: vi.fn(async () => ({ id: "assessment-1" })),
    ...overrides,
  };
}

function buildVoiceGateway(overrides?: Partial<SaveVoiceGateway>): SaveVoiceGateway {
  return {
    insertLifeRecord: vi.fn(async () => ({ id: "life-1" })),
    ...overrides,
  };
}

function buildNicknameGateway(
  overrides?: Partial<SaveParentNicknameGateway>,
): SaveParentNicknameGateway {
  return {
    getSessionUserId: vi.fn(async () => "user-1"),
    updateUserName: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("summarizeAssessmentAnswers", () => {
  it("calculates score and risk level from answers", () => {
    const result = summarizeAssessmentAnswers(["否", "否", "偶尔"]);

    expect(result).toEqual({
      totalQuestions: 3,
      riskAnswers: 2,
      score: 67,
      riskLevel: "high",
    });
  });
});

describe("saveAssessmentWithGateway", () => {
  it("persists assessment payload and returns assessment id", async () => {
    const gateway = buildAssessmentGateway();

    const result = await saveAssessmentWithGateway(gateway, {
      childId: "child-1",
      answers: ["是", "否", "偶尔"],
      questionSet: "mchat-lite-v1",
    });

    expect(gateway.insertAssessment).toHaveBeenCalledWith({
      childId: "child-1",
      type: "mchat_screening",
      riskLevel: "medium",
      result: {
        question_set: "mchat-lite-v1",
        answers: ["是", "否", "偶尔"],
        total_questions: 3,
        risk_answers: 1,
        score: 33,
      },
    });
    expect(result).toEqual({
      assessmentId: "assessment-1",
      riskLevel: "medium",
      score: 33,
    });
  });

  it("throws when childId is missing", async () => {
    const gateway = buildAssessmentGateway();

    await expect(
      saveAssessmentWithGateway(gateway, {
        childId: "",
        answers: ["是"],
        questionSet: "mchat-lite-v1",
      }),
    ).rejects.toThrow("缺少 child_id，无法保存评估结果。");
  });
});

describe("saveVoiceRecordWithGateway", () => {
  it("persists voice note as life_record behavior_event", async () => {
    const gateway = buildVoiceGateway();

    const result = await saveVoiceRecordWithGateway(gateway, {
      childId: "child-1",
      note: "今天切换任务时有哭闹，2 分钟后恢复",
      emotionIntensity: 3,
    });

    expect(gateway.insertLifeRecord).toHaveBeenCalledWith({
      childId: "child-1",
      type: "behavior_event",
      summary: "今天切换任务时有哭闹，2 分钟后恢复",
      content: {
        source: "voice_record_page",
        emotion_intensity: 3,
      },
    });
    expect(result).toEqual({ lifeRecordId: "life-1" });
  });
});

describe("saveParentNicknameWithGateway", () => {
  it("updates current user nickname", async () => {
    const gateway = buildNicknameGateway();

    const result = await saveParentNicknameWithGateway(gateway, "  新昵称  ");

    expect(gateway.updateUserName).toHaveBeenCalledWith({
      userId: "user-1",
      name: "新昵称",
    });
    expect(result).toEqual({ name: "新昵称" });
  });

  it("throws when session user is missing", async () => {
    const gateway = buildNicknameGateway({
      getSessionUserId: vi.fn(async () => null),
    });

    await expect(saveParentNicknameWithGateway(gateway, "妈妈")).rejects.toThrow(
      "请先登录后再修改昵称。",
    );
  });
});
