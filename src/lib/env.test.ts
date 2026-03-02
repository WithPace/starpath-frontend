import { describe, expect, it } from "vitest";

import { readFrontendEnv } from "./env";

describe("readFrontendEnv", () => {
  it("throws when a required key is missing", () => {
    expect(() =>
      readFrontendEnv({
        NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
        NEXT_PUBLIC_SUPABASE_URL: "https://db.example.com",
      }),
    ).toThrow("Missing required env: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("returns normalized values when all required keys are provided", () => {
    const env = readFrontendEnv({
      NEXT_PUBLIC_API_BASE_URL: " https://api.example.com ",
      NEXT_PUBLIC_SUPABASE_URL: "https://db.example.com",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    expect(env).toEqual({
      apiBaseUrl: "https://api.example.com",
      supabaseUrl: "https://db.example.com",
      supabaseAnonKey: "anon-key",
    });
  });
});
