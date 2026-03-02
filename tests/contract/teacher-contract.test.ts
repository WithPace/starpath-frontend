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

describe("teacher fixture contract", () => {
  it("contains teacher role done payload and dashboard cards", () => {
    const fixturePath = join(process.cwd(), "tests/fixtures/orchestrator/teacher-training-journey.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as FixturePack;

    const done = fixture.events.find((event) => event.event === "done");
    const delta = fixture.events.find((event) => event.event === "delta");

    expect(done).toBeDefined();
    expect(delta).toBeDefined();
    expect(done?.data.role).toBe("teacher");
    expect(delta?.data).toHaveProperty("cards");
  });
});
