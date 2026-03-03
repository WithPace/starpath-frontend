import { describe, expect, it } from "vitest";

import { useDashboardStore } from "./dashboard-store";

describe("useDashboardStore", () => {
  it("keeps dashboard cards isolated by role", () => {
    const store = useDashboardStore.getState();

    store.setCards("parent", [{ card_type: "summary_card", title: "家长看板" }]);
    store.setCards("doctor", [{ card_type: "metric_card", title: "医生看板" }]);

    expect(store.getCards("parent")[0]?.title).toBe("家长看板");
    expect(store.getCards("doctor")[0]?.title).toBe("医生看板");
  });

  it("keeps loading and error state isolated by role", () => {
    const store = useDashboardStore.getState();

    store.setLoading("org_admin", true);
    store.setError("org_admin", "permission denied");

    expect(store.isLoading("org_admin")).toBe(true);
    expect(store.getError("org_admin")).toBe("permission denied");
    expect(store.isLoading("parent")).toBe(false);
    expect(store.getError("parent")).toBeNull();
  });
});
