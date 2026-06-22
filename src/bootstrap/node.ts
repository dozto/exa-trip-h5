import { createLoadTripPlan } from "../features/load-trip-plan";
import { switchCurrentDay } from "../features/switch-current-day";
import { FileTripPlanRepository } from "../outbound/repositories/file-trip-plan.repository";
import { TripPlanSchemaZodValidator } from "../outbound/validators/trip-plan-schema.validator";

export const buildViewItineraryService = (options: {
  dataRootDir: string;
  tripIndex: Record<string, string>;
}) => {
  const repository = new FileTripPlanRepository(options.dataRootDir, options.tripIndex);
  const schemaValidator = new TripPlanSchemaZodValidator();

  return {
    loadTripPlan: createLoadTripPlan({
      repository,
      schemaValidator
    }),
    switchCurrentDay
  };
};
