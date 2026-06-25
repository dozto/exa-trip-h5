import type {
  FeasibilityAssessment,
  FeasibilityLevel,
  RouteLeg,
  RouteOption,
  NavigationPlan,
  RouteStrategy,
  TravelMode,
  EventEstimate,
  PlaceFocusLegs
} from "./route-plan";
import { formatMinutesToTime, parseTimeToMinutes } from "../../shared/time";

const byDuration = (a: RouteOption, b: RouteOption): number => a.durationMinutes - b.durationMinutes;

const byCost = (a: RouteOption, b: RouteOption): number => {
  const aCost = a.estimatedCost ?? Number.POSITIVE_INFINITY;
  const bCost = b.estimatedCost ?? Number.POSITIVE_INFINITY;
  if (aCost === bCost) {
    return byDuration(a, b);
  }
  return aCost - bCost;
};

const byComfort = (a: RouteOption, b: RouteOption): number => {
  const aComfort = a.comfortScore ?? 0;
  const bComfort = b.comfortScore ?? 0;
  if (aComfort === bComfort) {
    return byDuration(a, b);
  }
  return bComfort - aComfort;
};

export const selectOptionByStrategy = (
  options: RouteOption[],
  strategy: RouteStrategy = "fastest"
): RouteOption | null => {
  if (!options.length) {
    return null;
  }

  const matchingStrategy = options.filter((option) => option.strategy === strategy);

  if (matchingStrategy.length > 0) {
    return matchingStrategy[0] ?? null;
  }

  const sorted = [...options].sort((a, b) => {
    if (strategy === "cheapest") {
      return byCost(a, b);
    }
    if (strategy === "comfort") {
      return byComfort(a, b);
    }
    return byDuration(a, b);
  });

  return sorted[0] ?? null;
};

export const recommendMode = (
  options: RouteOption[],
  strategy: RouteStrategy = "fastest"
): TravelMode | null => {
  return selectOptionByStrategy(options, strategy)?.mode ?? null;
};

export const filterModesByContext = (
  modes: TravelMode[],
  context: { distanceKm?: number }
): TravelMode[] => {
  if ((context.distanceKm ?? 0) <= 1.5) {
    if (modes.includes("walk")) {
      return ["walk"];
    }
    return modes.slice(0, 1);
  }

  return modes;
};

export const buildRouteLegs = (placeSequence: { placeId: string }[]): RouteLeg[] => {
  const legs: RouteLeg[] = [];
  for (let index = 0; index < placeSequence.length - 1; index += 1) {
    const from = placeSequence[index];
    const to = placeSequence[index + 1];
    if (!from || !to) {
      continue;
    }
    legs.push({
      legId: `${from.placeId}->${to.placeId}`,
      fromPlaceId: from.placeId,
      toPlaceId: to.placeId,
      options: [],
      recommendedMode: null
    });
  }
  return legs;
};

export const selectLegsForPlace = (legs: RouteLeg[], placeId: string): PlaceFocusLegs => {
  const predecessor = legs.find((leg) => leg.toPlaceId === placeId) ?? null;
  const successor = legs.find((leg) => leg.fromPlaceId === placeId) ?? null;
  return { predecessor, successor };
};

export const estimateEventRisk = (input: {
  activityId: string;
  startTime?: string;
  travelMinutes: number;
  bufferMinutes: number;
}): EventEstimate => {
  const totalPrepMinutes = Math.max(0, input.travelMinutes) + Math.max(0, input.bufferMinutes);
  const latenessRiskLevel =
    totalPrepMinutes <= 20 ? "low" : totalPrepMinutes <= 45 ? "medium" : "high";
  const overrunRiskLevel = input.travelMinutes <= 25 ? "low" : input.travelMinutes <= 50 ? "medium" : "high";

  const start = input.startTime ? parseTimeToMinutes(input.startTime) : null;
  const recommendedDepartureTime =
    typeof start === "number" ? formatMinutesToTime(start - totalPrepMinutes) : undefined;

  return {
    activityId: input.activityId,
    recommendedDepartureTime,
    suggestedBufferMinutes: Math.max(0, input.bufferMinutes),
    latenessRiskLevel,
    overrunRiskLevel,
    travelMinutes: Math.max(0, input.travelMinutes)
  };
};

export const assessDayFeasibility = (
  links: Array<{
    fromActivityId: string;
    toActivityId: string;
    requiredMinutes: number;
    availableMinutes?: number;
  }>
): FeasibilityAssessment[] => {
  return links.map((link) => {
    if (typeof link.availableMinutes !== "number") {
      return {
        fromActivityId: link.fromActivityId,
        toActivityId: link.toActivityId,
        feasibility: "tight",
        adjustmentSuggestion: "Add explicit end/start time for better estimation"
      };
    }

    const slack = link.availableMinutes - link.requiredMinutes;
    let feasibility: FeasibilityLevel;
    let adjustmentSuggestion: string;

    if (slack >= 15) {
      feasibility = "feasible";
      adjustmentSuggestion = "No adjustment needed";
    } else if (slack >= 0) {
      feasibility = "tight";
      adjustmentSuggestion = `Consider leaving ${Math.max(5, 15 - slack)} minutes earlier`;
    } else {
      feasibility = "infeasible";
      adjustmentSuggestion = `Need at least ${Math.abs(slack)} extra minutes between activities`;
    }

    return {
      fromActivityId: link.fromActivityId,
      toActivityId: link.toActivityId,
      feasibility,
      adjustmentSuggestion
    };
  });
};

export const composeNavigationPlan = (input: {
  dayId: string;
  legs: RouteLeg[];
  updatedAt: string;
  isFallback: boolean;
}): NavigationPlan => {
  return {
    dayId: input.dayId,
    legs: input.legs,
    updatedAt: input.updatedAt,
    isFallback: input.isFallback
  };
};
