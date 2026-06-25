import type { TripPlan } from "../../domains/trip-planning/trip-plan";
import type { NavigationPlan, RouteStrategy, TravelMode } from "../../domains/trip-navigation/route-plan";

export type PlanTripRoutesInput = {
  tripPlan: TripPlan;
  dayId: string;
  departureTime?: string;
  /** @deprecated prefer strategies; still accepted for backward compatibility. */
  modes?: TravelMode[];
  strategies?: RouteStrategy[];
};

export type PlanTripRoutesOutput = NavigationPlan;
