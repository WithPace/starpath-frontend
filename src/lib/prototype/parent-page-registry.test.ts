import { describe, expect, it } from "vitest";

import { PARENT_PROTOTYPE_PAGES } from "./parent-page-registry";

describe("PARENT_PROTOTYPE_PAGES", () => {
  it("contains the complete 13-page prototype matrix", () => {
    expect(PARENT_PROTOTYPE_PAGES).toHaveLength(13);

    const ids = PARENT_PROTOTYPE_PAGES.map((item) => item.id);
    expect(ids).toEqual([
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ]);
  });

  it("maps required prototype pages to app routes", () => {
    const byId = new Map(PARENT_PROTOTYPE_PAGES.map((item) => [item.id, item.path]));
    expect(byId.get("00")).toBe("/welcome");
    expect(byId.get("01")).toBe("/auth");
    expect(byId.get("02")).toBe("/chat");
    expect(byId.get("03")).toBe("/quick-menu");
    expect(byId.get("12")).toBe("/training-detail");
  });
});
