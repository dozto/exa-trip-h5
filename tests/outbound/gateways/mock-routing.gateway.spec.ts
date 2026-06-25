import { describe, expect, it } from "vitest";
import { MockRoutingGateway } from "../../../src/outbound/gateways/mock-routing.gateway";

const from = {
  placeId: "place-a",
  name: "A",
  lat: 35.01,
  lng: 135.1
};

const to = {
  placeId: "place-b",
  name: "B",
  lat: 35.06,
  lng: 135.16
};

describe("MockRoutingGateway strategy-aware", () => {
  const gateway = new MockRoutingGateway();
  const callBase = async (strategy: "fastest" | "comfort" | "cheapest") => {
    return gateway.planRoute({
      from,
      to,
      mode: "drive",
      strategy,
      departureTime: "2026-07-01T08:00:00.000Z"
    });
  };

  it("fastest is faster than comfort and cheapest", async () => {
    const fastest = await callBase("fastest");
    const comfort = await callBase("comfort");
    const cheapest = await callBase("cheapest");

    expect(fastest.durationMinutes).toBeLessThan(comfort.durationMinutes);
    expect(comfort.durationMinutes).toBeGreaterThanOrEqual(fastest.durationMinutes);
    expect(cheapest.durationMinutes).toBeGreaterThan(fastest.durationMinutes);
    expect(cheapest.estimatedCost).toBeLessThanOrEqual((comfort.estimatedCost ?? Infinity));
  });

  it("attaches strategy tag to the result when strategy is passed", async () => {
    const result = await callBase("comfort");
    expect(result.strategy).toBe("comfort");
    expect(result.comfortScore).toBe(9);
  });

  it("emits multi-point geometry with detour for comfort strategy", async () => {
    const result = await callBase("comfort");
    expect(result.geometry.length).toBe(3);

    const fastest = await callBase("fastest");
    expect(fastest.geometry.length).toBe(2);
  });

  it("does not tag strategy when strategy is absent (backward compatible)", async () => {
    const result = await gateway.planRoute({
      from,
      to,
      mode: "drive",
      departureTime: "2026-07-01T08:00:00.000Z"
    });

    expect(result.strategy).toBeUndefined();
  });
});