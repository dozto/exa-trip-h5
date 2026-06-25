import type { Place } from "../../domains/trip-planning/trip-plan";
import type { RoutingGateway, RoutingRouteResult } from "../../features/plan-trip-routes/port";
import { haversineDistanceKm } from "../../shared/geo";

const distanceInKm = (from: Place, to: Place): number => {
  const calculated = haversineDistanceKm(from, to);
  if (typeof calculated === "number") {
    return Math.max(0.5, calculated);
  }

  return 3;
};

const speedByModeKmPerMinute: Record<"walk" | "transit" | "drive", number> = {
  walk: 0.08,
  transit: 0.18,
  drive: 0.45
};

const rounded = (value: number) => Math.round(value * 10) / 10;

export class MockRoutingGateway implements RoutingGateway {
  async planRoute(input: {
    from: Place;
    to: Place;
    mode: "walk" | "transit" | "drive";
    departureTime: string;
  }): Promise<RoutingRouteResult> {
    const distanceKm = distanceInKm(input.from, input.to);
    const speed = speedByModeKmPerMinute[input.mode];
    const durationMinutes = Math.max(5, Math.round(distanceKm / speed));

    return {
      mode: input.mode,
      distanceKm: rounded(distanceKm),
      durationMinutes,
      geometry: [
        [input.from.lng ?? 0, input.from.lat ?? 0],
        [input.to.lng ?? 0, input.to.lat ?? 0]
      ]
    };
  }
}
