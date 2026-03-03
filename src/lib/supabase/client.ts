import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readFrontendEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function tryCreateBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  let env;
  try {
    env = readFrontendEnv();
  } catch {
    return null;
  }

  browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const client = tryCreateBrowserSupabaseClient();
  if (!client) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return client;
}
