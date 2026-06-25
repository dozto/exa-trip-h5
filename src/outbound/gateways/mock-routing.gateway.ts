import type { Place } from "../../domains/trip-planning/trip-plan";
import type { RoutingGateway, RoutingRouteResult } from "../../features/plan-trip-routes/port";

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInKm = (from: Place, to: Place): number => {
  if (
    typeof from.lat === "number" &&
    typeof from.lng === "number" &&
    typeof to.lat === "number" &&
    typeof to.lng === "number"
  ) {
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(to.lat - from.lat);
    const deltaLng = toRadians(to.lng - from.lng);
    const sinHalfLat = Math.sin(deltaLat / 2);
    const sinHalfLng = Math.sin(deltaLng / 2);
    const a =
      sinHalfLat * sinHalfLat +
      Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * sinHalfLng * sinHalfLng;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(0.5, earthRadiusKm * c);
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
