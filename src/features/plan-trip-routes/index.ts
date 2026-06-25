import { buildDayPlaceSequence } from "../../domains/trip-planning/trip-plan";
import {
  composeNavigationPlan,
  filterModesByContext,
  recommendMode,
  type RouteLeg,
  type RouteOption,
  type NavigationPlan,
  type RouteStrategy,
  type TravelMode
} from "../../domains/trip-navigation/route-plan";
import { haversineDistanceKm } from "../../shared/geo";
import { err, ok } from "../../shared/result";
import type { PlanTripRoutes, PlanTripRoutesDependencies, PlanTripRoutesInput } from "./port";

const defaultModes: TravelMode[] = ["walk", "transit", "drive"];
const defaultStrategies: RouteStrategy[] = ["fastest", "comfort", "cheapest"];

const buildCacheKey = (
  input: PlanTripRoutesInput,
  modes: TravelMode[],
  strategies: RouteStrategy[]
): string => {
  return `${input.tripPlan.tripId}:${input.dayId}:${modes.join("-")}:${strategies.join("-")}:${input.departureTime ?? "now"}`;
};

export const createPlanTripRoutes = (deps: PlanTripRoutesDependencies): PlanTripRoutes => {
  const now = deps.now ?? (() => new Date());

  return async (input) => {
    const hasModes = Boolean(input.modes?.length);
    const hasStrategies = Boolean(input.strategies?.length);

    const modes = hasModes ? (input.modes as TravelMode[]) : defaultModes;
    const strategies = hasStrategies ? (input.strategies as RouteStrategy[]) : defaultStrategies;
    const legacySingleStrategyMode = hasModes && !hasStrategies;

    const departureTime = input.departureTime ?? now().toISOString();
    const cacheKey = buildCacheKey(input, modes, strategies);
    const places = buildDayPlaceSequence(input.tripPlan, input.dayId);

    if (places.length < 2) {
      return ok({
        dayId: input.dayId,
        legs: [],
        updatedAt: now().toISOString(),
        isFallback: false
      });
    }

    try {
      const legs: RouteLeg[] = [];

      for (let index = 0; index < places.length - 1; index += 1) {
        const from = places[index];
        const to = places[index + 1];

        if (!from || !to) {
          continue;
        }

        const legModes = filterModesByContext(modes, {
          distanceKm: haversineDistanceKm(from, to)
        });
        const legStrategies: RouteStrategy[] = legacySingleStrategyMode
          ? ["fastest"]
          : strategies;

        const options: RouteOption[] = [];
        for (const strategy of legStrategies) {
          for (const mode of legModes) {
            const route = await deps.routingGateway.planRoute({
              from,
              to,
              mode,
              strategy,
              departureTime
            });
            options.push({ ...route, strategy });
          }
        }

        legs.push({
          legId: `${from.placeId}->${to.placeId}`,
          fromPlaceId: from.placeId,
          toPlaceId: to.placeId,
          options,
          recommendedMode: recommendMode(options, "fastest")
        });
      }

      const navigationPlan: NavigationPlan = composeNavigationPlan({
        dayId: input.dayId,
        legs,
        updatedAt: now().toISOString(),
        isFallback: false
      });

      await deps.liveCacheRepository.setNavigationPlan(cacheKey, navigationPlan, 300);
      return ok(navigationPlan);
    } catch (error) {
      const fallback = await deps.liveCacheRepository.getNavigationPlan(cacheKey);
      if (fallback) {
        return ok({
          ...fallback,
          isFallback: true
        });
      }

      return ok({
        dayId: input.dayId,
        legs: [],
        updatedAt: now().toISOString(),
        isFallback: true
      });
    }
  };
};
