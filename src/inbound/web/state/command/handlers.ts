import type { LoadTripPlan } from "../../../../features/load-trip-plan/port";
import type { PlanTripRoutes } from "../../../../features/plan-trip-routes/port";
import type { ShowDayDecisionHints } from "../../../../features/show-day-decision-hints/port";
import type { SwitchCurrentDay } from "../../../../features/switch-current-day/port";
import type { NavigationPlan, DayDecisionHints } from "../../../../domains/trip-navigation/route-plan";
import type { TripPlan } from "../../../../domains/trip-planning/trip-plan";
import type { TravelMode } from "../../../../domains/trip-navigation/route-plan";
import type { TripUiCommandBus } from "../../events";
import { tripCommands } from "./commands";
import { TRIP_UI_COMMANDS } from "./events";

export type TripViewStoreApi = {
  getState: () => {
    tripPlan: TripPlan | null;
    currentDayId: string | null;
    selectedTravelMode: TravelMode;
    loadStarted: () => void;
    loadSucceeded: (tripPlan: TripPlan, currentDayId: string) => void;
    loadFailed: (message: string) => void;
    daySwitchSucceeded: (currentDayId: string) => void;
    daySwitchFailed: (message: string) => void;
    travelModeSelected: (mode: TravelMode) => void;
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
  const refreshDayDecisionHints = async (input: {
    dayId: string;
    navigationPlan: NavigationPlan;
  }) => {
    const state = deps.store.getState();
    if (!state.tripPlan) {
      return;
    }

    const decisionHints = await deps.showDayDecisionHints({
      tripPlan: state.tripPlan,
      dayId: input.dayId,
      navigationPlan: input.navigationPlan,
      defaultBufferMinutes: 15
    });

    if (!decisionHints.ok) {
      state.decisionHintsFailed(decisionHints.error.message);
      return;
    }

    state.decisionHintsSucceeded(decisionHints.value);
  };

  const stopPageOpened = deps.commandBus.on(TRIP_UI_COMMANDS.pageOpened, async (command) => {
    const state = deps.store.getState();
    state.loadStarted();

    const result = await deps.loadTripPlan({ tripId: command.tripId });
    if (!result.ok) {
      state.loadFailed(result.error.message);
      return;
    }

    state.loadSucceeded(result.value.tripPlan, result.value.currentDayId);

    const liveResult = await deps.planTripRoutes({
      tripPlan: result.value.tripPlan,
      dayId: result.value.currentDayId,
      modes: [state.selectedTravelMode]
    });
    if (!liveResult.ok) {
      state.navigationPlanFailed(liveResult.error.message);
      return;
    }
    state.navigationPlanSucceeded(liveResult.value);
    await refreshDayDecisionHints({
      dayId: result.value.currentDayId,
      navigationPlan: liveResult.value
    });
  });

  const handleSwitchDay = async (dayId: string) => {
    const result = await deps.switchCurrentDay({ dayId });
    if (!result.ok) {
      deps.store.getState().daySwitchFailed(result.error.message);
      return;
    }

    const state = deps.store.getState();
    state.daySwitchSucceeded(result.value.currentDayId);

    if (!state.tripPlan) {
      return;
    }
    const liveResult = await deps.planTripRoutes({
      tripPlan: state.tripPlan,
      dayId: result.value.currentDayId,
      modes: [state.selectedTravelMode]
    });
    if (!liveResult.ok) {
      state.navigationPlanFailed(liveResult.error.message);
      return;
    }
    state.navigationPlanSucceeded(liveResult.value);
    await refreshDayDecisionHints({
      dayId: result.value.currentDayId,
      navigationPlan: liveResult.value
    });
  };

  const stopDaySelected = deps.commandBus.on(TRIP_UI_COMMANDS.daySelected, async (command) => {
    await handleSwitchDay(command.dayId);
  });

  const stopMapPointSelected = deps.commandBus.on(
    TRIP_UI_COMMANDS.mapPointSelected,
    async (command) => {
      await handleSwitchDay(command.dayId);
    }
  );

  const stopTravelModeSelected = deps.commandBus.on(
    TRIP_UI_COMMANDS.travelModeSelected,
    async (command) => {
      const state = deps.store.getState();
      state.travelModeSelected(command.mode);
      if (!state.tripPlan || !state.currentDayId) {
        return;
      }

      const liveResult = await deps.planTripRoutes({
        tripPlan: state.tripPlan,
        dayId: state.currentDayId,
        modes: [command.mode]
      });

      if (!liveResult.ok) {
        state.navigationPlanFailed(liveResult.error.message);
        return;
      }

      state.navigationPlanSucceeded(liveResult.value);
      await refreshDayDecisionHints({
        dayId: state.currentDayId,
        navigationPlan: liveResult.value
      });
    }
  );

  return () => {
    stopPageOpened();
    stopDaySelected();
    stopMapPointSelected();
    stopTravelModeSelected();
  };
};

export { tripCommands };