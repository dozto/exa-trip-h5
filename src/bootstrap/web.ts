import { MockTripPlanRepository } from "../outbound/repositories/mock-trip-plan.repository";
import { TripPlanSchemaZodValidator } from "../outbound/validators/trip-plan-schema.validator";
import { createLoadTripPlan } from "../features/load-trip-plan";
import { switchCurrentDay } from "../features/switch-current-day";
import { createTripUiCommandBus } from "../inbound/web/events";
import type { TripModelRuntime } from "../inbound/web/state/store/runtime-context";
import { registerTripModelHandlers } from "../inbound/web/state/command/handlers";

export const bootstrapWebApp = (): TripModelRuntime => {
  const repository = new MockTripPlanRepository();
  const schemaValidator = new TripPlanSchemaZodValidator();

  const loadTripPlan = createLoadTripPlan({
    repository,
    schemaValidator
  });

  const commandBus = createTripUiCommandBus();

  const stopHandlers = registerTripModelHandlers({
    commandBus,
    loadTripPlan,
    switchCurrentDay
  });

  return {
    commandBus,
    dispose: stopHandlers
  };
};
