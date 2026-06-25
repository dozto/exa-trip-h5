import type { TripPlan } from "../../domains/trip-planning/trip-plan";
import type {
  DayDecisionHints,
  NavigationPlan,
  RouteStrategy
} from "../../domains/trip-navigation/route-plan";

export type ShowDayDecisionHintsInput = {
  tripPlan: TripPlan;
  dayId: string;
  navigationPlan: NavigationPlan;
  strategy?: RouteStrategy;
  defaultBufferMinutes?: number;
};

export type ShowDayDecisionHintsOutput = DayDecisionHints;
