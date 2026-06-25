export type TravelMode = "walk" | "transit" | "drive";

export type RouteStrategy = "fastest" | "comfort" | "cheapest";

export type RiskLevel = "low" | "medium" | "high";

export type FeasibilityLevel = "feasible" | "tight" | "infeasible";

export type RouteOption = {
  mode: TravelMode;
  durationMinutes: number;
  distanceKm: number;
  estimatedCost?: number;
  comfortScore?: number;
  confidence?: RiskLevel;
  geometry: [number, number][];
};

export type RouteLeg = {
  legId: string;
  fromPlaceId: string;
  toPlaceId: string;
  options: RouteOption[];
  recommendedMode: TravelMode | null;
};

export type NavigationPlan = {
  dayId: string;
  legs: RouteLeg[];
  updatedAt: string;
  isFallback: boolean;
};

export type EventEstimate = {
  activityId: string;
  recommendedDepartureTime?: string;
  suggestedBufferMinutes: number;
  latenessRiskLevel: RiskLevel;
  overrunRiskLevel: RiskLevel;
  travelMinutes: number;
};

export type FeasibilityAssessment = {
  fromActivityId: string;
  toActivityId: string;
  feasibility: FeasibilityLevel;
  adjustmentSuggestion: string;
};

export type DayDecisionHints = {
  dayId: string;
  eventEstimates: EventEstimate[];
  feasibilityAssessments: FeasibilityAssessment[];
  updatedAt: string;
};

export {
  assessDayFeasibility,
  buildRouteLegs,
  composeNavigationPlan,
  estimateEventRisk,
  filterModesByContext,
  recommendMode,
  selectOptionByStrategy
} from "./route-plan.methods";
