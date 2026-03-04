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

function readDefaultNextPublicEnv(): RawEnv {
  // In Next.js client bundles, dynamic access like process.env[name] may be empty.
  // Read NEXT_PUBLIC vars via static property access so Turbopack can inline values.
  return {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function readFrontendEnv(env?: RawEnv): FrontendEnv {
  const source = env ?? readDefaultNextPublicEnv();
  return {
    apiBaseUrl: requireEnv(source, "NEXT_PUBLIC_API_BASE_URL"),
    supabaseUrl: requireEnv(source, "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requireEnv(source, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
