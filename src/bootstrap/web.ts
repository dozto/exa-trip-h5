import { MockTripPlanRepository } from "../outbound/repositories/mock-trip-plan.repository";
import { TripPlanSchemaZodValidator } from "../outbound/validators/trip-plan-schema.validator";
import { createLoadTripPlan } from "../features/load-trip-plan";
import { createPlanTripRoutes } from "../features/plan-trip-routes";
import { createShowDayDecisionHints } from "../features/show-day-decision-hints";
import { switchCurrentDay } from "../features/switch-current-day";
import { createTripUiCommandBus } from "../inbound/web/events";
import type { TripModelRuntime } from "../inbound/web/state/store/runtime-context";
import { registerTripModelHandlers } from "../inbound/web/state/command/handlers";
import { useTripViewStore } from "../inbound/web/state/store/view-store";
import { MapboxRoutingGateway } from "../outbound/gateways/mapbox-routing.gateway";
import { MockRoutingGateway } from "../outbound/gateways/mock-routing.gateway";
import { InMemoryLiveCacheRepository } from "../outbound/repositories/in-memory-live-cache.repository";

export const bootstrapWebApp = (): TripModelRuntime => {
  const repository = new MockTripPlanRepository();
  const schemaValidator = new TripPlanSchemaZodValidator();

  const loadTripPlan = createLoadTripPlan({
    repository,
    schemaValidator
  });
  const liveCacheRepository = new InMemoryLiveCacheRepository();
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const routingGateway = mapboxAccessToken
    ? new MapboxRoutingGateway({
        accessToken: mapboxAccessToken
      })
    : new MockRoutingGateway();

  const planTripRoutes = createPlanTripRoutes({
    routingGateway,
    liveCacheRepository
  });
  const showDayDecisionHints = createShowDayDecisionHints();

  const commandBus = createTripUiCommandBus();

  const stopHandlers = registerTripModelHandlers({
    commandBus,
    store: useTripViewStore,
    loadTripPlan,
    switchCurrentDay,
    planTripRoutes,
    showDayDecisionHints
  });

  return {
    commandBus,
    dispose: stopHandlers
  };
};