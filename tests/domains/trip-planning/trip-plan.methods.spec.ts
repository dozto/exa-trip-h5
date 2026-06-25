import { describe, expect, it } from "vitest";
import type { TripPlan } from "../../../src/domains/trip-planning/trip-plan";
import {
  assertPlanInvariants,
  buildDayPlaceSequence,
  deriveDayPreparations,
  deriveDaySuggestions,
  getDay,
  getDefaultDayId,
  listDayActivities
} from "../../../src/domains/trip-planning/trip-plan.methods";

const basePlace = { placeId: "p1", name: "Place A" };

const baseDay = {
  dayId: "day-1",
  date: "2026-07-01",
  dayIndex: 1,
  items: [
    {
      itemId: "i1",
      title: "Activity A",
      content: "Desc",
      placeId: "p1",
      durationMinutes: 30
    }
  ]
};

const basePlan: TripPlan = {
  schemaVersion: "1.0.0",
  tripId: "trip-1",
  title: "Test Trip",
  timezone: "UTC",
  startDate: "2026-07-01",
  endDate: "2026-07-01",
  days: [baseDay],
  places: { p1: basePlace }
};

describe("getDay", () => {
  it("returns the day when dayId exists", () => {
    expect(getDay(basePlan, "day-1")?.dayId).toBe("day-1");
  });

  it("returns null when dayId does not exist", () => {
    expect(getDay(basePlan, "day-404")).toBeNull();
  });
});

describe("getDefaultDayId", () => {
  it("returns first day when no date matches today", () => {
    const result = getDefaultDayId(basePlan, new Date("1999-01-01"), "UTC");
    expect(result).toBe("day-1");
  });

  it("returns matched day when date equals today in timezone", () => {
    const result = getDefaultDayId(basePlan, new Date("2026-07-01T12:00:00Z"), "UTC");
    expect(result).toBe("day-1");
  });
});

describe("listDayActivities", () => {
  it("returns activities for existing day", () => {
    const items = listDayActivities(basePlan, "day-1");
    expect(items).toHaveLength(1);
    expect(items[0]?.itemId).toBe("i1");
  });

  it("returns empty array for missing day", () => {
    expect(listDayActivities(basePlan, "day-404")).toHaveLength(0);
  });
});

describe("buildDayPlaceSequence", () => {
  it("returns deduplicated places in activity order", () => {
    const plan: TripPlan = {
      ...basePlan,
      days: [
        {
          ...baseDay,
          items: [
            { itemId: "a", title: "A", content: "c", placeId: "p1", durationMinutes: 30 },
            { itemId: "b", title: "B", content: "c", placeId: "p2", durationMinutes: 30 },
            { itemId: "c", title: "C", content: "c", placeId: "p2", durationMinutes: 30 },
            { itemId: "d", title: "D", content: "c", placeId: "p3", durationMinutes: 30 }
          ]
        }
      ],
      places: {
        p1: { placeId: "p1", name: "A" },
        p2: { placeId: "p2", name: "B" },
        p3: { placeId: "p3", name: "C" }
      }
    };

    const sequence = buildDayPlaceSequence(plan, "day-1");
    expect(sequence.map((p) => p.placeId)).toEqual(["p1", "p2", "p3"]);
  });

  it("returns empty array for missing day", () => {
    expect(buildDayPlaceSequence(basePlan, "day-404")).toHaveLength(0);
  });

  it("skips items without placeId", () => {
    const plan: TripPlan = {
      ...basePlan,
      days: [
        {
          ...baseDay,
          items: [
            { itemId: "a", title: "A", content: "c", durationMinutes: 30 },
            { itemId: "b", title: "B", content: "c", placeId: "p1", durationMinutes: 30 }
          ]
        }
      ]
    };

    const sequence = buildDayPlaceSequence(plan, "day-1");
    expect(sequence).toHaveLength(1);
    expect(sequence[0]?.placeId).toBe("p1");
  });
});

describe("deriveDayPreparations", () => {
  it("merges item-level and day-level preparations", () => {
    const plan: TripPlan = {
      ...basePlan,
      days: [
        {
          ...baseDay,
          items: [
            {
              itemId: "i1",
              title: "A",
              content: "c",
              durationMinutes: 30,
              preparations: [
                { id: "prep1", title: "Bring water", level: "must" as const }
              ]
            }
          ],
          preparations: [
            { id: "prep2", title: "Check weather", level: "should" as const }
          ]
        }
      ]
    };

    const result = deriveDayPreparations(plan.days[0]!);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["prep1", "prep2"]);
  });

  it("deduplicates by id", () => {
    const plan: TripPlan = {
      ...basePlan,
      days: [
        {
          ...baseDay,
          items: [
            {
              itemId: "i1",
              title: "A",
              content: "c",
              durationMinutes: 30,
              preparations: [
                { id: "prep1", title: "Bring water", level: "must" as const }
              ]
            }
          ],
          preparations: [
            { id: "prep1", title: "Bring water (dup)", level: "should" as const }
          ]
        }
      ]
    };

    const result = deriveDayPreparations(plan.days[0]!);
    expect(result).toHaveLength(1);
  });
});

describe("deriveDaySuggestions", () => {
  it("merges item-level and day-level suggestions", () => {
    const plan: TripPlan = {
      ...basePlan,
      days: [
        {
          ...baseDay,
          items: [
            {
              itemId: "i1",
              title: "A",
              content: "c",
              durationMinutes: 30,
              suggestions: [
                { id: "s1", type: "timing" as const, content: "Leave early", priority: "high" as const }
              ]
            }
          ],
          suggestions: [
            { id: "s2", type: "safety" as const, content: "Watch traffic", priority: "medium" as const }
          ]
        }
      ]
    };

    const result = deriveDaySuggestions(plan.days[0]!);
    expect(result).toHaveLength(2);
  });
});

describe("assertPlanInvariants", () => {
  it("returns empty array for valid plan", () => {
    expect(assertPlanInvariants(basePlan)).toHaveLength(0);
  });

  it("detects days empty", () => {
    const plan: TripPlan = { ...basePlan, days: [] };
    const violations = assertPlanInvariants(plan);
    expect(violations.some((v) => v.code === "plan_days_empty")).toBe(true);
  });

  it("detects startDate after endDate", () => {
    const plan: TripPlan = { ...basePlan, startDate: "2026-07-05", endDate: "2026-07-01" };
    const violations = assertPlanInvariants(plan);
    expect(violations.some((v) => v.code === "plan_date_range_invalid")).toBe(true);
  });

  it("detects duplicate dayIndex", () => {
    const plan: TripPlan = {
      ...basePlan,
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      days: [
        { ...baseDay, dayId: "day-1", dayIndex: 1, date: "2026-07-01" },
        { ...baseDay, dayId: "day-2", dayIndex: 1, date: "2026-07-02" }
      ]
    };
    const violations = assertPlanInvariants(plan);
    expect(violations.some((v) => v.code === "day_index_duplicated")).toBe(true);
  });

  it("detects activity with missing place", () => {
    const plan: TripPlan = {
      ...basePlan,
      days: [
        {
          ...baseDay,
          items: [
            { itemId: "i1", title: "A", content: "c", placeId: "p-missing", durationMinutes: 30 }
          ]
        }
      ]
    };
    const violations = assertPlanInvariants(plan);
    expect(violations.some((v) => v.code === "activity_place_not_found")).toBe(true);
  });
});