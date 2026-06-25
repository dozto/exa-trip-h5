import { describe, expect, it } from "vitest";
import type { NavigationPlan } from "../../../src/domains/trip-navigation/route-plan";
import type { TripPlan } from "../../../src/domains/trip-planning/trip-plan";
import { createShowDayDecisionHints } from "../../../src/features/show-day-decision-hints";

const sampleTripPlan: TripPlan = {
  schemaVersion: "1.0.0",
  tripId: "trip-1",
  title: "Trip",
  timezone: "UTC",
  startDate: "2026-07-01",
  endDate: "2026-07-01",
  days: [
    {
      dayId: "day-1",
      date: "2026-07-01",
      dayIndex: 1,
      items: [
        {
          itemId: "i1",
          title: "Breakfast",
          content: "Cafe",
          placeId: "p1",
          startTime: "09:00",
          endTime: "09:45",
          durationMinutes: 45
        },
        {
          itemId: "i2",
          title: "Museum",
          content: "Visit museum",
          placeId: "p2",
          startTime: "10:30",
          durationMinutes: 90
        }
      ]
    }
  ],
  places: {
    p1: { placeId: "p1", name: "A", lat: 35.01, lng: 135.1 },
    p2: { placeId: "p2", name: "B", lat: 35.06, lng: 135.16 }
  }
};

const sampleNavigationPlan: NavigationPlan = {
  dayId: "day-1",
  legs: [
    {
      legId: "p1->p2",
      fromPlaceId: "p1",
      toPlaceId: "p2",
      options: [
        {
          mode: "walk",
          durationMinutes: 20,
          distanceKm: 2.4,
          geometry: [
            [135.1, 35.01],
            [135.16, 35.06]
          ]
        },
        {
          mode: "drive",
          durationMinutes: 8,
          distanceKm: 2.4,
          geometry: [
            [135.1, 35.01],
            [135.16, 35.06]
          ]
        }
      ],
      recommendedMode: "drive"
    }
  ],
  updatedAt: "2026-07-01T08:00:00.000Z",
  isFallback: false
};

describe("createShowDayDecisionHints", () => {
  it("returns event estimates and feasibility assessments", async () => {
    const showDayDecisionHints = createShowDayDecisionHints({
      now: () => new Date("2026-07-01T08:00:00.000Z")
    });

    const result = await showDayDecisionHints({
      tripPlan: sampleTripPlan,
      dayId: "day-1",
      navigationPlan: sampleNavigationPlan,
      strategy: "fastest",
      defaultBufferMinutes: 15
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.eventEstimates).toHaveLength(2);
      expect(result.value.eventEstimates[1]?.travelMinutes).toBe(8);
      expect(result.value.feasibilityAssessments).toHaveLength(1);
      expect(result.value.feasibilityAssessments[0]?.feasibility).toBe("feasible");
    }
  });

  it("returns controlled error when day does not exist", async () => {
    const showDayDecisionHints = createShowDayDecisionHints();

    const result = await showDayDecisionHints({
      tripPlan: sampleTripPlan,
      dayId: "day-404",
      navigationPlan: sampleNavigationPlan
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("trip_load_failed");
    }
  });
});
