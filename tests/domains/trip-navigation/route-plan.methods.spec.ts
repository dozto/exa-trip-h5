import { describe, expect, it } from "vitest";
import {
  assessDayFeasibility,
  buildRouteLegs,
  composeNavigationPlan,
  estimateEventRisk,
  filterModesByContext,
  selectOptionByStrategy
} from "../../../src/domains/trip-navigation/route-plan.methods";
import type { NavigationPlan, RouteOption, TravelMode } from "../../../src/domains/trip-navigation/route-plan";

const makeOption = (mode: TravelMode, durationMinutes: number, distanceKm = 1.0): RouteOption => ({
  mode,
  durationMinutes,
  distanceKm,
  geometry: [[0, 0], [1, 1]]
});

describe("filterModesByContext", () => {
  it("returns walk-only when distance <= 1.5 km and walk is in modes", () => {
    const result = filterModesByContext(["walk", "transit", "drive"], { distanceKm: 1.0 });
    expect(result).toEqual(["walk"]);
  });

  it("returns first mode when walk not in modes and distance <= 1.5", () => {
    const result = filterModesByContext(["transit", "drive"], { distanceKm: 0.5 });
    expect(result).toEqual(["transit"]);
  });

  it("returns all modes when distance > 1.5 km", () => {
    const result = filterModesByContext(["walk", "transit", "drive"], { distanceKm: 3.0 });
    expect(result).toEqual(["walk", "transit", "drive"]);
  });

  it("returns walk-only when distance undefined (treated as 0, <= 1.5)", () => {
    const result = filterModesByContext(["walk", "transit"], {});
    expect(result).toEqual(["walk"]);
  });
});

describe("selectOptionByStrategy", () => {
  const options: RouteOption[] = [
    makeOption("walk", 30, 2),
    makeOption("drive", 10, 2),
    makeOption("transit", 20, 2)
  ];

  it("selects fastest by default", () => {
    const result = selectOptionByStrategy(options);
    expect(result?.mode).toBe("drive");
  });

  it("selects fastest explicitly", () => {
    const result = selectOptionByStrategy(options, "fastest");
    expect(result?.mode).toBe("drive");
  });

  it("selects cheapest when strategy=cheapest and costs differ", () => {
    const expensiveOptions: RouteOption[] = [
      { ...makeOption("walk", 30, 2), estimatedCost: 100 },
      { ...makeOption("transit", 20, 2), estimatedCost: 50 }
    ];
    const result = selectOptionByStrategy(expensiveOptions, "cheapest");
    expect(result?.mode).toBe("transit");
  });

  it("selects most comfortable when strategy=comfort", () => {
    const comfyOptions: RouteOption[] = [
      { ...makeOption("walk", 30, 2), comfortScore: 3 },
      { ...makeOption("drive", 10, 2), comfortScore: 8 }
    ];
    const result = selectOptionByStrategy(comfyOptions, "comfort");
    expect(result?.mode).toBe("drive");
  });

  it("returns null for empty options", () => {
    expect(selectOptionByStrategy([])).toBeNull();
  });
});

describe("estimateEventRisk", () => {
  it("returns low risk when total prep <= 20 minutes", () => {
    const result = estimateEventRisk({
      activityId: "a1",
      startTime: "10:00",
      travelMinutes: 10,
      bufferMinutes: 5
    });
    expect(result.latenessRiskLevel).toBe("low");
    expect(result.recommendedDepartureTime).toBe("09:45");
  });

  it("returns medium risk when total prep 21-45 minutes", () => {
    const result = estimateEventRisk({
      activityId: "a1",
      travelMinutes: 25,
      bufferMinutes: 10
    });
    expect(result.latenessRiskLevel).toBe("medium");
  });

  it("returns high risk when total prep > 45 minutes", () => {
    const result = estimateEventRisk({
      activityId: "a1",
      travelMinutes: 40,
      bufferMinutes: 10
    });
    expect(result.latenessRiskLevel).toBe("high");
  });

  it("returns undefined departure time when no startTime provided", () => {
    const result = estimateEventRisk({
      activityId: "a1",
      travelMinutes: 10,
      bufferMinutes: 5
    });
    expect(result.recommendedDepartureTime).toBeUndefined();
  });

  it("handles negative travel minutes by clamping to 0", () => {
    const result = estimateEventRisk({
      activityId: "a1",
      travelMinutes: -5,
      bufferMinutes: 5
    });
    expect(result.travelMinutes).toBe(0);
    expect(result.latenessRiskLevel).toBe("low");
  });
});

describe("assessDayFeasibility", () => {
  it("returns feasible when slack >= 15 minutes", () => {
    const result = assessDayFeasibility([
      { fromActivityId: "a1", toActivityId: "a2", requiredMinutes: 20, availableMinutes: 40 }
    ]);
    expect(result[0]?.feasibility).toBe("feasible");
  });

  it("returns tight when slack 0-15 minutes", () => {
    const result = assessDayFeasibility([
      { fromActivityId: "a1", toActivityId: "a2", requiredMinutes: 25, availableMinutes: 30 }
    ]);
    expect(result[0]?.feasibility).toBe("tight");
  });

  it("returns infeasible when slack < 0", () => {
    const result = assessDayFeasibility([
      { fromActivityId: "a1", toActivityId: "a2", requiredMinutes: 30, availableMinutes: 15 }
    ]);
    expect(result[0]?.feasibility).toBe("infeasible");
  });

  it("returns tight with hint when availableMinutes undefined", () => {
    const result = assessDayFeasibility([
      { fromActivityId: "a1", toActivityId: "a2", requiredMinutes: 20 }
    ]);
    expect(result[0]?.feasibility).toBe("tight");
    expect(result[0]?.adjustmentSuggestion).toContain("explicit");
  });
});

describe("buildRouteLegs", () => {
  it("builds legs from place sequence", () => {
    const legs = buildRouteLegs([{ placeId: "p1" }, { placeId: "p2" }, { placeId: "p3" }]);
    expect(legs).toHaveLength(2);
    expect(legs[0]?.legId).toBe("p1->p2");
    expect(legs[1]?.legId).toBe("p2->p3");
    expect(legs[0]?.options).toEqual([]);
  });

  it("returns empty array for single place", () => {
    const legs = buildRouteLegs([{ placeId: "p1" }]);
    expect(legs).toHaveLength(0);
  });
});

describe("composeNavigationPlan", () => {
  it("assembles navigation plan with given parameters", () => {
    const plan: NavigationPlan = composeNavigationPlan({
      dayId: "day-1",
      legs: [],
      updatedAt: "2026-07-01T08:00:00.000Z",
      isFallback: false
    });

    expect(plan.dayId).toBe("day-1");
    expect(plan.legs).toEqual([]);
    expect(plan.isFallback).toBe(false);
  });
});