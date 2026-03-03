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

export type AssessmentRiskLevel = "low" | "medium" | "high";

export type AssessmentSummary = {
  totalQuestions: number;
  riskAnswers: number;
  score: number;
  riskLevel: AssessmentRiskLevel;
};

export type SaveAssessmentInput = {
  childId: string;
  answers: string[];
  questionSet: string;
};

type AssessmentInsertInput = {
  childId: string;
  type: string;
  riskLevel: AssessmentRiskLevel;
  result: Record<string, unknown>;
};

export type SaveAssessmentGateway = {
  insertAssessment: (input: AssessmentInsertInput) => Promise<{ id: string }>;
};

export type SaveAssessmentResult = {
  assessmentId: string;
  score: number;
  riskLevel: AssessmentRiskLevel;
};

export type SaveVoiceInput = {
  childId: string;
  note: string;
  emotionIntensity?: number;
};

type LifeRecordInsertInput = {
  childId: string;
  type: "behavior_event";
  summary: string;
  content: Record<string, unknown>;
};

export type SaveVoiceGateway = {
  insertLifeRecord: (input: LifeRecordInsertInput) => Promise<{ id: string }>;
};

export type SaveVoiceResult = {
  lifeRecordId: string;
};

export type AssessmentHistoryRow = {
  id: string;
  created_at: string | null;
  risk_level: string | null;
  result: Record<string, unknown> | null;
};

export type VoiceHistoryRow = {
  id: string;
  occurred_at: string | null;
  summary: string | null;
  content: Record<string, unknown> | null;
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

function normalizeRiskLevel(riskAnswers: number, totalQuestions: number): AssessmentRiskLevel {
  const ratio = totalQuestions > 0 ? riskAnswers / totalQuestions : 0;
  if (ratio >= 0.6) return "high";
  if (ratio >= 0.3) return "medium";
  return "low";
}

export function summarizeAssessmentAnswers(answers: string[]): AssessmentSummary {
  const totalQuestions = answers.length;
  const riskAnswers = answers.filter((value) => value === "否").length;
  const score = totalQuestions > 0 ? Math.round((riskAnswers / totalQuestions) * 100) : 0;
  return {
    totalQuestions,
    riskAnswers,
    score,
    riskLevel: normalizeRiskLevel(riskAnswers, totalQuestions),
  };
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

export async function saveAssessmentWithGateway(
  gateway: SaveAssessmentGateway,
  input: SaveAssessmentInput,
): Promise<SaveAssessmentResult> {
  const childId = input.childId.trim();
  if (!childId) {
    throw new Error("缺少 child_id，无法保存评估结果。");
  }
  if (input.answers.length === 0) {
    throw new Error("评估答案为空，无法保存。");
  }

  const summary = summarizeAssessmentAnswers(input.answers);

  const record = await gateway.insertAssessment({
    childId,
    type: "mchat_screening",
    riskLevel: summary.riskLevel,
    result: {
      question_set: input.questionSet,
      answers: input.answers,
      total_questions: summary.totalQuestions,
      risk_answers: summary.riskAnswers,
      score: summary.score,
    },
  });

  return {
    assessmentId: record.id,
    score: summary.score,
    riskLevel: summary.riskLevel,
  };
}

export async function saveVoiceRecordWithGateway(
  gateway: SaveVoiceGateway,
  input: SaveVoiceInput,
): Promise<SaveVoiceResult> {
  const childId = input.childId.trim();
  if (!childId) {
    throw new Error("缺少 child_id，无法保存记录。");
  }
  const note = input.note.trim();
  if (!note) {
    throw new Error("请先填写记录内容。");
  }

  const record = await gateway.insertLifeRecord({
    childId,
    type: "behavior_event",
    summary: note,
    content: {
      source: "voice_record_page",
      emotion_intensity: input.emotionIntensity ?? null,
    },
  });

  return {
    lifeRecordId: record.id,
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

export function buildSaveAssessmentGateway(client: SupabaseClient): SaveAssessmentGateway {
  return {
    async insertAssessment(input) {
      const { data, error } = await client
        .from("assessments")
        .insert({
          child_id: input.childId,
          type: input.type,
          result: input.result,
          risk_level: input.riskLevel,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`写入 assessments 失败：${error.message}`);
      }

      return {
        id: (data as { id: string }).id,
      };
    },
  };
}

export function buildSaveVoiceGateway(client: SupabaseClient): SaveVoiceGateway {
  return {
    async insertLifeRecord(input) {
      const { data, error } = await client
        .from("life_records")
        .insert({
          child_id: input.childId,
          type: input.type,
          summary: input.summary,
          content: input.content,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(`写入 life_records 失败：${error.message}`);
      }

      return {
        id: (data as { id: string }).id,
      };
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

export async function saveAssessment(
  client: SupabaseClient,
  input: SaveAssessmentInput,
): Promise<SaveAssessmentResult> {
  return saveAssessmentWithGateway(buildSaveAssessmentGateway(client), input);
}

export async function saveVoiceRecord(
  client: SupabaseClient,
  input: SaveVoiceInput,
): Promise<SaveVoiceResult> {
  return saveVoiceRecordWithGateway(buildSaveVoiceGateway(client), input);
}

export async function listRecentAssessments(
  client: SupabaseClient,
  childId: string,
  limit = 5,
): Promise<AssessmentHistoryRow[]> {
  const { data, error } = await client
    .from("assessments")
    .select("id,created_at,risk_level,result")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`读取 assessments 失败：${error.message}`);
  }

  return ((data as AssessmentHistoryRow[] | null) ?? []);
}

export async function listRecentVoiceRecords(
  client: SupabaseClient,
  childId: string,
  limit = 5,
): Promise<VoiceHistoryRow[]> {
  const { data, error } = await client
    .from("life_records")
    .select("id,occurred_at,summary,content")
    .eq("child_id", childId)
    .eq("type", "behavior_event")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`读取 life_records 失败：${error.message}`);
  }

  return ((data as VoiceHistoryRow[] | null) ?? []);
}
