import type { TripPlan } from "../../domains/trip-planning/trip-plan";
import type { NavigationPlan, TravelMode } from "../../domains/trip-navigation/route-plan";

export type PlanTripRoutesInput = {
  tripPlan: TripPlan;
  dayId: string;
  departureTime?: string;
  modes?: TravelMode[];
};

export type PlanTripRoutesOutput = NavigationPlan;
