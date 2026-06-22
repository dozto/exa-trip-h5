import type { AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result";
import type {
  LoadTripPlan,
  LoadTripPlanDependencies,
  LoadTripPlanInput,
  LoadTripPlanOutput
} from "./port";

export const createLoadTripPlan = (deps: LoadTripPlanDependencies): LoadTripPlan => {
  return async (input: LoadTripPlanInput): Promise<Result<LoadTripPlanOutput, AppError>> => {
    let rawData: unknown | null;
    try {
      rawData = await deps.repository.loadById(input.tripId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown repository error";
      return err({
        code: "trip_load_failed",
        message: `Failed to load trip data: ${input.tripId} (${message})`
      });
    }

    if (!rawData) {
      return err({
        code: "trip_not_found",
        message: `Trip data not found: ${input.tripId}`
      });
    }

    const validation = deps.schemaValidator.validate(rawData);
    if (!validation.ok) {
      return err({
        code: "trip_invalid_schema",
        message: validation.error.message,
        details: {
          issues: validation.error.issues
        }
      });
    }

    const tripPlan = validation.value;
    const defaultDay = tripPlan.days[0];
    if (!defaultDay) {
      return err({
        code: "trip_load_failed",
        message: "Trip has no day entries"
      });
    }

    return ok({
      tripPlan,
      currentDayId: defaultDay.dayId
    });
  };
};
