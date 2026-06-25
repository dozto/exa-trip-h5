import type { Place } from "../../domains/trip-planning/trip-plan";
import type { RouteStrategy, TravelMode } from "../../domains/trip-navigation/route-plan";
import type { RoutingGateway, RoutingRouteResult } from "../../features/plan-trip-routes/port";
import { haversineDistanceKm } from "../../shared/geo";

const distanceInKm = (from: Place, to: Place): number => {
  const calculated = haversineDistanceKm(from, to);
  if (typeof calculated === "number") {
    return Math.max(0.5, calculated);
  }

  return 3;
};

const speedByModeKmPerMinute: Record<TravelMode, number> = {
  walk: 0.08,
  transit: 0.18,
  drive: 0.45
};

const rounded = (value: number) => Math.round(value * 10) / 10;

const estimatedCostByMode: Record<TravelMode, number> = {
  walk: 0,
  transit: 3,
  drive: 8
};

const midPoint = (
  from: Place,
  to: Place,
  offset: number
): [number, number] => {
  const fromLng = typeof from.lng === "number" ? from.lng : 0;
  const fromLat = typeof from.lat === "number" ? from.lat : 0;
  const toLng = typeof to.lng === "number" ? to.lng : 0;
  const toLat = typeof to.lat === "number" ? to.lat : 0;
  const midLng = (fromLng + toLng) / 2 + offset;
  const midLat = (fromLat + toLat) / 2 + offset * 0.5;
  return [midLng, midLat];
};

const buildGeometry = (
  from: Place,
  to: Place,
  strategy: RouteStrategy | undefined
): [number, number][] => {
  const start: [number, number] = [
    typeof from.lng === "number" ? from.lng : 0,
    typeof from.lat === "number" ? from.lat : 0
  ];
  const end: [number, number] = [
    typeof to.lng === "number" ? to.lng : 0,
    typeof to.lat === "number" ? to.lat : 0
  ];

  const midOffset =
    strategy === "comfort" ? 0.012 : strategy === "cheapest" ? -0.006 : 0;
  if (!midOffset) {
    return [start, end];
  }

  return [start, midPoint(from, to, midOffset), end];
};

export class MockRoutingGateway implements RoutingGateway {
  async planRoute(input: {
    from: Place;
    to: Place;
    mode: TravelMode;
    strategy?: RouteStrategy;
    departureTime: string;
  }): Promise<RoutingRouteResult> {
    const distanceKm = distanceInKm(input.from, input.to);
    const speed = speedByModeKmPerMinute[input.mode];
    const baseDurationMinutes = Math.max(5, Math.round(distanceKm / speed));
    const strategy = input.strategy;

    const durationMultiplier =
      strategy === "comfort"
        ? 1.15
        : strategy === "cheapest"
          ? 1.1
          : 1;
    const durationMinutes = Math.round(baseDurationMinutes * durationMultiplier);

    const estimatedCost = strategy === "cheapest"
      ? Math.max(0, Math.round(estimatedCostByMode[input.mode] * 0.5 * 10) / 10)
      : estimatedCostByMode[input.mode];

    const comfortScore = strategy === "comfort"
      ? 9
      : strategy === "fastest"
        ? 5
        : 6;

    const result: RoutingRouteResult = {
      mode: input.mode,
      distanceKm: rounded(distanceKm),
      durationMinutes,
      geometry: buildGeometry(input.from, input.to, strategy)
    };

    if (strategy) {
      result.strategy = strategy;
      result.estimatedCost = estimatedCost;
      result.comfortScore = comfortScore;
    }

    return result;
  }
}