import { describe, expect, it, vi } from "vitest";

import {
  createChildProfileWithGateway,
  type CreateChildGateway,
  type CreateChildInput,
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
