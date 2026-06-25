import type { Place } from "../../domains/trip-planning/trip-plan";
import type { RouteStrategy } from "../../domains/trip-navigation/route-plan";
import type { RoutingGateway, RoutingRouteResult } from "../../features/plan-trip-routes/port";

type MapboxProfile = "walking" | "driving";

type MapboxRoute = {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

type MapboxDirectionsResponse = {
  routes?: MapboxRoute[];
  message?: string;
};

type MapboxRoutingGatewayOptions = {
  accessToken: string;
  fetcher?: typeof fetch;
};

const toProfile = (mode: "walk" | "transit" | "drive"): MapboxProfile => {
  switch (mode) {
    case "walk":
      return "walking";
    case "transit":
      return "driving";
    case "drive":
      return "driving";
  }
};

const assertCoordinate = (place: Place): { lat: number; lng: number } => {
  if (typeof place.lat !== "number" || typeof place.lng !== "number") {
    throw new Error(`Mapbox route requires coordinates: ${place.placeId}`);
  }

  return {
    lat: place.lat,
    lng: place.lng
  };
};

const pickByStrategy = (routes: MapboxRoute[], strategy?: RouteStrategy): MapboxRoute => {
  if (routes.length <= 1 || !strategy) {
    return routes[0] as MapboxRoute;
  }

  if (strategy === "fastest") {
    return [...routes].sort((a, b) => a.duration - b.duration)[0] as MapboxRoute;
  }

  if (strategy === "cheapest") {
    return [...routes].sort((a, b) => a.distance - b.distance)[0] as MapboxRoute;
  }

  return [...routes].sort((a, b) => b.duration - a.duration)[0] as MapboxRoute;
};

export class MapboxRoutingGateway implements RoutingGateway {
  private readonly accessToken: string;

  private readonly fetcher: typeof fetch;

  constructor(options: MapboxRoutingGatewayOptions) {
    this.accessToken = options.accessToken;
    this.fetcher = options.fetcher ?? fetch.bind(globalThis);
  }

  async planRoute(input: {
    from: Place;
    to: Place;
    mode: "walk" | "transit" | "drive";
    strategy?: RouteStrategy;
    departureTime: string;
  }): Promise<RoutingRouteResult> {
    const from = assertCoordinate(input.from);
    const to = assertCoordinate(input.to);
    const profile = toProfile(input.mode);

    const endpoint = new URL(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}`
    );
    endpoint.searchParams.set("alternatives", input.strategy ? "true" : "false");
    endpoint.searchParams.set("steps", "false");
    endpoint.searchParams.set("overview", "full");
    endpoint.searchParams.set("geometries", "geojson");
    endpoint.searchParams.set("access_token", this.accessToken);

    const response = await this.fetcher(endpoint);
    const payload = (await response.json()) as MapboxDirectionsResponse;

    if (!response.ok) {
      throw new Error(`Mapbox directions failed (${response.status}): ${payload.message ?? "Unknown error"}`);
    }

    const availableRoutes = payload.routes ?? [];
    const route = pickByStrategy(availableRoutes, input.strategy);
    if (!route) {
      throw new Error("Mapbox directions returned no routes");
    }

    const baseDurationMinutes = Math.max(1, Math.round(route.duration / 60));
    const durationMinutes =
      input.mode === "transit" ? Math.max(baseDurationMinutes + 8, Math.round(baseDurationMinutes * 1.25)) : baseDurationMinutes;

    return {
      mode: input.mode,
      strategy: input.strategy,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMinutes,
      geometry: route.geometry.coordinates
    };
  }
}