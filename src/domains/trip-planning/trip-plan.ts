import type { z } from "zod";
import {
  itineraryItemSchema,
  placeSchema,
  preparationItemSchema,
  suggestionItemSchema,
  tripCategorySchema,
  tripDaySchema,
  tripPlanSchema
} from "./trip-plan.schema";

export type TripCategory = z.infer<typeof tripCategorySchema>;
export type PreparationItem = z.infer<typeof preparationItemSchema>;
export type SuggestionItem = z.infer<typeof suggestionItemSchema>;
export type Place = z.infer<typeof placeSchema>;
export type ItineraryItem = z.infer<typeof itineraryItemSchema>;
export type ActivityItem = ItineraryItem;
export type TripDay = z.infer<typeof tripDaySchema>;
export type TripPlan = z.infer<typeof tripPlanSchema>;

export { tripPlanSchema };
export {
  assertPlanInvariants,
  buildDayPlaceSequence,
  deriveDayPreparations,
  deriveDaySuggestions,
  getDay,
  getDefaultDayId,
  listDayActivities,
  type PlanInvariantViolation
} from "./trip-plan.methods";
