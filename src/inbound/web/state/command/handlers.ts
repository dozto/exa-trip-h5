import type { LoadTripPlan } from "../../../../features/load-trip-plan/port";
import type { SwitchCurrentDay } from "../../../../features/switch-current-day/port";
import type { TripUiCommandBus } from "../../events";
import { useTripViewStore } from "../store/view-store";
import { TRIP_UI_COMMANDS } from "./events";

type TripModelHandlerDependencies = {
  commandBus: TripUiCommandBus;
  loadTripPlan: LoadTripPlan;
  switchCurrentDay: SwitchCurrentDay;
};

export const registerTripModelHandlers = (
  deps: TripModelHandlerDependencies
): (() => void) => {
  const stopPageOpened = deps.commandBus.on(TRIP_UI_COMMANDS.pageOpened, async (command) => {
    const state = useTripViewStore.getState();
    state.loadStarted();

    const result = await deps.loadTripPlan({ tripId: command.tripId });
    if (!result.ok) {
      state.loadFailed(result.error.message);
      return;
    }

    state.loadSucceeded(result.value.tripPlan, result.value.currentDayId);
  });

  const handleSwitchDay = async (dayId: string) => {
    const result = await deps.switchCurrentDay({ dayId });
    if (!result.ok) {
      useTripViewStore.getState().daySwitchFailed(result.error.message);
      return;
    }

    useTripViewStore.getState().daySwitchSucceeded(result.value.currentDayId);
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

  return () => {
    stopPageOpened();
    stopDaySelected();
    stopMapPointSelected();
  };
};
