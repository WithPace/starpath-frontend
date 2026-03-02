export type FrontendEnv = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type RawEnv = Record<string, string | undefined>;

function requireEnv(env: RawEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function readFrontendEnv(env: RawEnv = process.env): FrontendEnv {
  return {
    apiBaseUrl: requireEnv(env, "NEXT_PUBLIC_API_BASE_URL"),
    supabaseUrl: requireEnv(env, "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requireEnv(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
