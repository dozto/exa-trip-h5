import { describe, expect, it, vi } from "vitest";
import exampleTrip from "../../../contracts/itinerary.v1.example.json";
import type { TripPlan } from "../../../src/domains/trip-planning/trip-plan";
import { createLoadTripPlan } from "../../../src/features/load-trip-plan";
import type {
  TripPlanRepository,
  TripPlanSchemaValidator,
  ValidationResult
} from "../../../src/features/load-trip-plan/port";

const createDeps = (options?: {
  repositoryData?: unknown | null;
  validationResult?: ValidationResult<TripPlan>;
}) => {
  const hasRepositoryData = options && Object.prototype.hasOwnProperty.call(options, "repositoryData");

  const repository: TripPlanRepository = {
    loadById: vi.fn(async () => (hasRepositoryData ? options?.repositoryData ?? null : exampleTrip))
  };

  const schemaValidator: TripPlanSchemaValidator = {
    validate: vi.fn(() => {
      if (options?.validationResult) {
        return options.validationResult;
      }

      return {
        ok: true as const,
        value: exampleTrip as TripPlan
      };
    })
  };

  return {
    repository,
    schemaValidator
  };
};

describe("createLoadTripPlan", () => {
  it("loads valid trip plan and updates view state", async () => {
    const deps = createDeps();
    const loadTripPlan = createLoadTripPlan(deps);

    const result = await loadTripPlan({ tripId: "trip-jp-kansai-2026-spring" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.currentDayId).toBe("day-1");
      expect(result.value.tripPlan.tripId).toBe("trip-jp-kansai-2026-spring");
    }
  });

  it("returns validation error and prevents store update", async () => {
    const deps = createDeps({
      validationResult: {
        ok: false,
        error: {
          message: "Trip schema validation failed",
          issues: ["/days/0/items/0/durationMinutes must be >= 1"]
        }
      }
    });
    const loadTripPlan = createLoadTripPlan(deps);

    const result = await loadTripPlan({ tripId: "trip-jp-kansai-2026-spring" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("trip_invalid_schema");
    }
  });

  it("returns not found error when repository has no trip", async () => {
    const deps = createDeps({ repositoryData: null });
    const loadTripPlan = createLoadTripPlan(deps);

    const result = await loadTripPlan({ tripId: "missing-trip" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("trip_not_found");
    }
    expect(deps.schemaValidator.validate).not.toHaveBeenCalled();
  });

  it("returns load failed error when repository throws", async () => {
    const deps = createDeps();
    deps.repository.loadById = vi.fn(async () => {
      throw new Error("network down");
    });
    const loadTripPlan = createLoadTripPlan(deps);

    const result = await loadTripPlan({ tripId: "trip-jp-kansai-2026-spring" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("trip_load_failed");
      expect(result.error.message).toContain("network down");
    }
  });
});
