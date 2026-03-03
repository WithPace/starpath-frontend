import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateChildInput = {
  nickname: string;
  age?: string;
  diagnosisLevel?: string;
};

type SessionUser = {
  id: string;
  phone: string | null;
  name: string | null;
};

type UserUpsertInput = {
  id: string;
  phone: string | null;
  name: string | null;
};

type ChildInsertInput = {
  nickname: string;
  createdBy: string;
  birthDate: string | null;
};

type CareTeamInsertInput = {
  userId: string;
  childId: string;
};

type MedicalInsertInput = {
  childId: string;
  diagnosisLevel: string;
};

export type CreateChildResult = {
  childId: string;
  warnings: string[];
};

export type CreateChildGateway = {
  getSessionUser: () => Promise<SessionUser | null>;
  upsertUser: (input: UserUpsertInput) => Promise<void>;
  insertChild: (input: ChildInsertInput) => Promise<{ id: string }>;
  upsertParentCareTeam: (input: CareTeamInsertInput) => Promise<void>;
  insertMedical: (input: MedicalInsertInput) => Promise<void>;
};

type CreateChildOptions = {
  now?: Date | string;
};

function normalizeNow(now?: Date | string): Date {
  if (!now) return new Date();
  if (now instanceof Date) return now;
  return new Date(now);
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function resolveBirthDateFromAge(ageRaw: string | undefined, now?: Date | string): string | null {
  if (!ageRaw) return null;
  const parsed = Number.parseInt(ageRaw, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 30) {
    return null;
  }

  const base = normalizeNow(now);
  const birth = new Date(
    Date.UTC(base.getUTCFullYear() - parsed, base.getUTCMonth(), base.getUTCDate()),
  );
  return birth.toISOString().slice(0, 10);
}

export async function createChildProfileWithGateway(
  gateway: CreateChildGateway,
  input: CreateChildInput,
  options?: CreateChildOptions,
): Promise<CreateChildResult> {
  const user = await gateway.getSessionUser();
  if (!user?.id) {
    throw new Error("请先登录后再创建孩子档案。");
  }

  const nickname = input.nickname.trim();
  if (!nickname) {
    throw new Error("请填写孩子昵称。");
  }

  await gateway.upsertUser({
    id: user.id,
    phone: user.phone,
    name: user.name,
  });

  const child = await gateway.insertChild({
    nickname,
    createdBy: user.id,
    birthDate: resolveBirthDateFromAge(input.age, options?.now),
  });

  await gateway.upsertParentCareTeam({
    userId: user.id,
    childId: child.id,
  });

  const warnings: string[] = [];
  const diagnosisLevel = readString(input.diagnosisLevel);
  if (diagnosisLevel) {
    try {
      await gateway.insertMedical({
        childId: child.id,
        diagnosisLevel,
      });
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "children_medical 初始化失败");
    }
  }

  return {
    childId: child.id,
    warnings,
  };
}

export function buildCreateChildGateway(client: SupabaseClient): CreateChildGateway {
  return {
    async getSessionUser() {
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw new Error(`读取登录会话失败：${error.message}`);
      }
      const user = data.session?.user;
      if (!user) return null;
      return {
        id: user.id,
        phone: user.phone ?? null,
        name: readString(user.user_metadata?.name) ?? readString(user.user_metadata?.nickname),
      };
    },
    async upsertUser(input) {
      const { error } = await client.from("users").upsert(
        {
          id: input.id,
          phone: input.phone,
          name: input.name,
        },
        { onConflict: "id" },
      );
      if (error) {
        throw new Error(`写入 users 失败：${error.message}`);
      }
    },
    async insertChild(input) {
      const insertPayload: Record<string, unknown> = {
        nickname: input.nickname,
        created_by: input.createdBy,
      };
      if (input.birthDate) {
        insertPayload.birth_date = input.birthDate;
      }

      const { data, error } = await client
        .from("children")
        .insert(insertPayload)
        .select("id")
        .single();

      if (error) {
        throw new Error(`创建 children 失败：${error.message}`);
      }

      return {
        id: (data as { id: string }).id,
      };
    },
    async upsertParentCareTeam(input) {
      const { error } = await client.from("care_teams").upsert(
        {
          user_id: input.userId,
          child_id: input.childId,
          role: "parent",
          status: "active",
        },
        { onConflict: "user_id,child_id,role" },
      );

      if (error) {
        throw new Error(`写入 care_teams 失败：${error.message}`);
      }
    },
    async insertMedical(input) {
      const { error } = await client.from("children_medical").insert({
        child_id: input.childId,
        diagnosis_level: input.diagnosisLevel,
      });

      if (error) {
        throw new Error(`写入 children_medical 失败：${error.message}`);
      }
    },
  };
}

export async function createChildProfile(
  client: SupabaseClient,
  input: CreateChildInput,
  options?: CreateChildOptions,
): Promise<CreateChildResult> {
  return createChildProfileWithGateway(buildCreateChildGateway(client), input, options);
}
