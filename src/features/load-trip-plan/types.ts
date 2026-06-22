import type { TripPlan } from "../../domains/trip-planning/trip-plan";

export type LoadTripPlanInput = {
  tripId: string;
};

export type LoadTripPlanOutput = {
  tripPlan: TripPlan;
  currentDayId: string;
};

export type ValidationFailure = {
  message: string;
  issues: string[];
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ValidationFailure };
