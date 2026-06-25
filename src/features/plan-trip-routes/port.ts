import type { Place } from "../../domains/trip-planning/trip-plan";
import type { NavigationPlan, RouteOption, TravelMode } from "../../domains/trip-navigation/route-plan";
import type { AppError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import type { PlanTripRoutesInput, PlanTripRoutesOutput } from "./types";

export type PlanTripRoutes = (
  input: PlanTripRoutesInput
) => Promise<Result<PlanTripRoutesOutput, AppError>>;

export type RoutingRouteResult = RouteOption;

export interface RoutingGateway {
  planRoute(input: {
    from: Place;
    to: Place;
    mode: TravelMode;
    departureTime: string;
  }): Promise<RoutingRouteResult>;
}

export interface LiveCacheRepository {
  getNavigationPlan(cacheKey: string): Promise<NavigationPlan | null>;
  setNavigationPlan(cacheKey: string, value: NavigationPlan, ttlSeconds: number): Promise<void>;
}

export type PlanTripRoutesDependencies = {
  routingGateway: RoutingGateway;
  liveCacheRepository: LiveCacheRepository;
  now?: () => Date;
};

export type { PlanTripRoutesInput, PlanTripRoutesOutput };
