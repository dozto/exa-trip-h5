import { describe, expect, it, vi } from "vitest";
import type { TripPlan } from "../../../src/domains/trip-planning/trip-plan";
import { createPlanTripRoutes } from "../../../src/features/plan-trip-routes";
import type {
  LiveCacheRepository,
  RoutingGateway,
  RoutingRouteResult
} from "../../../src/features/plan-trip-routes/port";

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
          title: "A",
          content: "A",
          placeId: "p1",
          durationMinutes: 30
        },
        {
          itemId: "i2",
          title: "B",
          content: "B",
          placeId: "p2",
          durationMinutes: 40
        }
      ]
    }
  ],
  places: {
    p1: { placeId: "p1", name: "A", lat: 35.01, lng: 135.1 },
    p2: { placeId: "p2", name: "B", lat: 35.06, lng: 135.16 }
  }
};

const createRoutingResult = (mode: "walk" | "transit" | "drive"): RoutingRouteResult => ({
  mode,
  durationMinutes: mode === "drive" ? 15 : mode === "transit" ? 28 : 34,
  distanceKm: 5.5,
  geometry: [
    [135.1, 35.01],
    [135.16, 35.06]
  ]
});

const createDeps = () => {
  const routingGateway: RoutingGateway = {
    planRoute: vi.fn(async ({ mode }) => createRoutingResult(mode))
  };
  const liveCacheRepository: LiveCacheRepository = {
    getNavigationPlan: vi.fn(async () => null),
    setNavigationPlan: vi.fn(async () => undefined)
  };

  return {
    routingGateway,
    liveCacheRepository
  };
};

describe("createPlanTripRoutes", () => {
  it("returns route legs with mode options", async () => {
    const deps = createDeps();
    const planTripRoutes = createPlanTripRoutes(deps);

    const result = await planTripRoutes({
      tripPlan: sampleTripPlan,
      dayId: "day-1",
      departureTime: "2026-07-01T08:00:00.000Z"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.legs).toHaveLength(1);
      expect(result.value.legs[0]?.options).toHaveLength(3);
      expect(result.value.legs[0]?.options.some((option) => option.mode === "transit")).toBe(true);
      expect(result.value.isFallback).toBe(false);
    }
  });

  it("returns fallback when gateway fails and cache exists", async () => {
    const deps = createDeps();
    const fallback = {
      dayId: "day-1",
      legs: [
        {
          legId: "p1->p2",
          fromPlaceId: "p1",
          toPlaceId: "p2",
          options: [createRoutingResult("walk")],
          recommendedMode: "walk" as const
        }
      ],
      updatedAt: "2026-07-01T08:00:00.000Z",
      isFallback: false
    };

    deps.routingGateway.planRoute = vi.fn(async () => {
      throw new Error("service unavailable");
    });
    deps.liveCacheRepository.getNavigationPlan = vi.fn(async () => fallback);

    const planTripRoutes = createPlanTripRoutes(deps);
    const result = await planTripRoutes({
      tripPlan: sampleTripPlan,
      dayId: "day-1"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isFallback).toBe(true);
      expect(result.value.legs[0]?.recommendedMode).toBe("walk");
    }
  });

  it("uses walk-only mode on short legs", async () => {
    const deps = createDeps();
    const planTripRoutes = createPlanTripRoutes(deps);

    const shortTrip: TripPlan = {
      ...sampleTripPlan,
      places: {
        p1: { placeId: "p1", name: "A", lat: 35.01, lng: 135.1 },
        p2: { placeId: "p2", name: "B", lat: 35.0104, lng: 135.1005 }
      }
    };

    const result = await planTripRoutes({
      tripPlan: shortTrip,
      dayId: "day-1",
      departureTime: "2026-07-01T08:00:00.000Z"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.legs).toHaveLength(1);
      expect(result.value.legs[0]?.options).toHaveLength(1);
      expect(result.value.legs[0]?.options[0]?.mode).toBe("walk");
      expect(result.value.legs[0]?.recommendedMode).toBe("walk");
    }
  });
});
