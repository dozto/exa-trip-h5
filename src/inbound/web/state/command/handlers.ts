import type { LoadTripPlan } from "../../../../features/load-trip-plan/port";
import type { PlanTripRoutes } from "../../../../features/plan-trip-routes/port";
import type { ShowDayDecisionHints } from "../../../../features/show-day-decision-hints/port";
import type { SwitchCurrentDay } from "../../../../features/switch-current-day/port";
import type { NavigationPlan, DayDecisionHints } from "../../../../domains/trip-navigation/route-plan";
import type { TripPlan } from "../../../../domains/trip-planning/trip-plan";
import type { RouteStrategy } from "../../../../domains/trip-navigation/route-plan";
import type { TripUiCommandBus } from "../../events";
import { tripCommands } from "./commands";
import { TRIP_UI_COMMANDS } from "./events";

export type TripViewStoreApi = {
  getState: () => {
    tripPlan: TripPlan | null;
    currentDayId: string | null;
    selectedStrategy: RouteStrategy;
    viewLevel: "overview" | "day" | "place";
    selectedPlaceId: string | null;
    loadStarted: () => void;
    loadSucceeded: (tripPlan: TripPlan, currentDayId: string) => void;
    loadFailed: (message: string) => void;
    daySwitchSucceeded: (currentDayId: string) => void;
    daySwitchFailed: (message: string) => void;
    strategySelected: (strategy: RouteStrategy) => void;
    placeSelected: (placeId: string) => void;
    goToDayView: () => void;
    goToOverview: () => void;
    navigationPlanSucceeded: (navigationPlan: NavigationPlan | null) => void;
    navigationPlanFailed: (message: string) => void;
    decisionHintsSucceeded: (hints: DayDecisionHints | null) => void;
    decisionHintsFailed: (message: string) => void;
  };
};

type TripModelHandlerDependencies = {
  commandBus: TripUiCommandBus;
  store: TripViewStoreApi;
  loadTripPlan: LoadTripPlan;
  switchCurrentDay: SwitchCurrentDay;
  planTripRoutes: PlanTripRoutes;
  showDayDecisionHints: ShowDayDecisionHints;
};

export const registerTripModelHandlers = (
  deps: TripModelHandlerDependencies
): (() => void) => {
  const dependencies = deps;

  const refreshDayDecisionHints = async (input: {
    dayId: string;
    navigationPlan: NavigationPlan;
  }) => {
    const state = dependencies.store.getState();
    if (!state.tripPlan) {
      return;
    }

    const decisionHints = await dependencies.showDayDecisionHints({
      tripPlan: state.tripPlan,
      dayId: input.dayId,
      navigationPlan: input.navigationPlan,
      strategy: state.selectedStrategy,
      defaultBufferMinutes: 15
    });

    if (!decisionHints.ok) {
      state.decisionHintsFailed(decisionHints.error.message);
      return;
    }

    state.decisionHintsSucceeded(decisionHints.value);
  };

  const planAllStrategyRoutesForCurrentDay = async (input: {
    tripPlan: TripPlan;
    dayId: string;
  }) => {
    const liveResult = await dependencies.planTripRoutes({
      tripPlan: input.tripPlan,
      dayId: input.dayId
    });

    if (!liveResult.ok) {
      dependencies.store.getState().navigationPlanFailed(liveResult.error.message);
      return null;
    }

    dependencies.store.getState().navigationPlanSucceeded(liveResult.value);
    return liveResult.value;
  };

  const stopPageOpened = dependencies.commandBus.on(TRIP_UI_COMMANDS.pageOpened, async (command) => {
    const state = dependencies.store.getState();
    state.loadStarted();

    const result = await dependencies.loadTripPlan({ tripId: command.tripId });
    if (!result.ok) {
      state.loadFailed(result.error.message);
      return;
    }

    state.loadSucceeded(result.value.tripPlan, result.value.currentDayId);

    const navigationPlan = await planAllStrategyRoutesForCurrentDay({
      tripPlan: result.value.tripPlan,
      dayId: result.value.currentDayId
    });
    if (navigationPlan) {
      await refreshDayDecisionHints({
        dayId: result.value.currentDayId,
        navigationPlan
      });
    }
  });

  const handleSwitchDay = async (dayId: string) => {
    const result = await dependencies.switchCurrentDay({ dayId });
    if (!result.ok) {
      dependencies.store.getState().daySwitchFailed(result.error.message);
      return;
    }

    const state = dependencies.store.getState();
    state.daySwitchSucceeded(result.value.currentDayId);

    if (!state.tripPlan) {
      return;
    }
    const navigationPlan = await planAllStrategyRoutesForCurrentDay({
      tripPlan: state.tripPlan,
      dayId: result.value.currentDayId
    });
    if (navigationPlan) {
      await refreshDayDecisionHints({
        dayId: result.value.currentDayId,
        navigationPlan
      });
    }
  };

  const stopDaySelected = dependencies.commandBus.on(TRIP_UI_COMMANDS.daySelected, async (command) => {
    await handleSwitchDay(command.dayId);
  });

  const stopMapPointSelected = dependencies.commandBus.on(
    TRIP_UI_COMMANDS.mapPointSelected,
    async (command) => {
      await handleSwitchDay(command.dayId);
    }
  );

  const stopStrategySelected = dependencies.commandBus.on(
    TRIP_UI_COMMANDS.strategySelected,
    async (command) => {
      const state = dependencies.store.getState();
      state.strategySelected(command.strategy);
    }
  );

  const stopPlaceSelected = dependencies.commandBus.on(
    TRIP_UI_COMMANDS.placeSelected,
    async (command) => {
      dependencies.store.getState().placeSelected(command.placeId);
    }
  );

  const stopViewEscaped = dependencies.commandBus.on(TRIP_UI_COMMANDS.viewEscaped, async () => {
    const state = dependencies.store.getState();
    if (state.viewLevel === "place") {
      state.goToDayView();
      return;
    }
    if (state.viewLevel === "day") {
      state.goToOverview();
    }
  });

  return () => {
    stopPageOpened();
    stopDaySelected();
    stopMapPointSelected();
    stopStrategySelected();
    stopPlaceSelected();
    stopViewEscaped();
  };
};

export { tripCommands };