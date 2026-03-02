import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

type FixtureEvent = {
  event: string;
  data: Record<string, unknown>;
};

type FixturePack = {
  events: FixtureEvent[];
};

describe("org admin fixture contract", () => {
  it("contains org_admin role done payload and dashboard cards", () => {
    const fixturePath = join(process.cwd(), "tests/fixtures/orchestrator/org-admin-member-management.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as FixturePack;

    const done = fixture.events.find((event) => event.event === "done");
    const delta = fixture.events.find((event) => event.event === "delta");

    expect(done).toBeDefined();
    expect(delta).toBeDefined();
    expect(done?.data.role).toBe("org_admin");
    expect(delta?.data).toHaveProperty("cards");
  });
});
