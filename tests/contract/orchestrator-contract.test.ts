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

describe("orchestrator fixture contract", () => {
  it("contains required event payload keys for phase4 frontend consumption", () => {
    const fixturePath = join(process.cwd(), "tests/fixtures/orchestrator/parent-weekly-journey.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as FixturePack;

    const delta = fixture.events.find((event) => event.event === "delta");
    const done = fixture.events.find((event) => event.event === "done");
    const error = fixture.events.find((event) => event.event === "error");

    expect(delta).toBeDefined();
    expect(done).toBeDefined();
    expect(error).toBeDefined();

    expect(delta?.data).toHaveProperty("request_id");
    expect(delta?.data).toHaveProperty("cards");
    expect(done?.data).toHaveProperty("request_id");
    expect(done?.data).toHaveProperty("module");
    expect(error?.data).toHaveProperty("reason");
  });
});
