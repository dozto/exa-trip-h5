import { describe, expect, it } from "vitest";
import { MockTripPlanRepository } from "../../../src/outbound/repositories/mock-trip-plan.repository";

describe("MockTripPlanRepository", () => {
  it("loads trip plan by indexed trip id", async () => {
    const repository = new MockTripPlanRepository();

    const data = await repository.loadById("trip-jp-kansai-2026-spring");

    expect(data).not.toBeNull();
    expect(data).toMatchObject({
      tripId: "trip-jp-kansai-2026-spring"
    });
  });

  it("returns null when trip id is unknown", async () => {
    const repository = new MockTripPlanRepository();

    const data = await repository.loadById("trip-not-exists");

    expect(data).toBeNull();
  });
});
