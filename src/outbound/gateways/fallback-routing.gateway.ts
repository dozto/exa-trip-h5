import type { RoutingGateway, RoutingRouteResult } from "../../features/plan-trip-routes/port";
import type { Place } from "../../domains/trip-planning/trip-plan";
import type { RouteStrategy, TravelMode } from "../../domains/trip-navigation/route-plan";

export type FallbackRoutingGatewayOptions = {
  primary: RoutingGateway;
  fallback: RoutingGateway;
  onFallback?: (error: unknown, input: RoutingRouteInput) => void;
};

type RoutingRouteInput = {
  from: Place;
  to: Place;
  mode: TravelMode;
  strategy?: RouteStrategy;
  departureTime: string;
};

export class FallbackRoutingGateway implements RoutingGateway {
  private readonly primary: RoutingGateway;
  private readonly fallback: RoutingGateway;
  private readonly onFallback?: (error: unknown, input: RoutingRouteInput) => void;

  constructor(options: FallbackRoutingGatewayOptions) {
    this.primary = options.primary;
    this.fallback = options.fallback;
    this.onFallback = options.onFallback;
  }

  async planRoute(input: RoutingRouteInput): Promise<RoutingRouteResult> {
    try {
      return await this.primary.planRoute(input);
    } catch (error) {
      this.onFallback?.(error, input);
      return this.fallback.planRoute(input);
    }
  }
}