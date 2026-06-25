import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildTripCurrentCardModel,
  buildTripDateStripModel,
  buildTripHeaderModel,
  buildTripMapModel,
  buildTripTipsModel
} from "./view-model";
import type { TravelMode } from "../../../../domains/trip-navigation/route-plan";
import { tripCommands } from "../command/commands";
import { useTripModelRuntime } from "../store/runtime-context";
import { selectCurrentDay } from "./selectors";
import { useTripViewStore } from "../store/view-store";

const defaultTripId = import.meta.env.VITE_TRIP_ID ?? "trip-jp-kansai-2026-spring";

export const useItineraryPageModel = () => {
  const { commandBus } = useTripModelRuntime();
  const [focusedActivityId, setFocusedActivityId] = useState<string | null>(null);
  const tripPlan = useTripViewStore((state) => state.tripPlan);
  const currentDayId = useTripViewStore((state) => state.currentDayId);
  const isLoading = useTripViewStore((state) => state.isLoading);
  const errorMessage = useTripViewStore((state) => state.errorMessage);
  const navigationPlan = useTripViewStore((state) => state.navigationPlan);
  const dayDecisionHints = useTripViewStore((state) => state.dayDecisionHints);
  const navigationPlanWarning = useTripViewStore((state) => state.navigationPlanWarning);
  const decisionHintsWarning = useTripViewStore((state) => state.decisionHintsWarning);
  const selectedTravelMode = useTripViewStore((state) => state.selectedTravelMode);

  const currentDay = useMemo(() => selectCurrentDay(tripPlan, currentDayId), [tripPlan, currentDayId]);
  const headerModel = useMemo(() => buildTripHeaderModel(tripPlan), [tripPlan]);
  const tipsModel = useMemo(() => buildTripTipsModel(tripPlan, currentDay), [tripPlan, currentDay]);
  const dateStripModel = useMemo(
    () => buildTripDateStripModel(tripPlan, currentDayId),
    [tripPlan, currentDayId]
  );
  const mapModel = useMemo(
    () =>
      buildTripMapModel(
        tripPlan,
        currentDayId,
        navigationPlan,
        dayDecisionHints,
        selectedTravelMode
      ),
    [tripPlan, currentDayId, navigationPlan, dayDecisionHints, selectedTravelMode]
  );
  const currentCardModel = useMemo(
    () => buildTripCurrentCardModel(tripPlan, currentDay, tipsModel, dayDecisionHints),
    [tripPlan, currentDay, tipsModel, dayDecisionHints]
  );

  const onSwitchDay = useCallback((dayId: string) => {
    commandBus.emit(tripCommands.daySelected(dayId));
  }, [commandBus]);

  const onSelectMapPoint = useCallback((dayId: string) => {
    commandBus.emit(tripCommands.mapPointSelected(dayId));
  }, [commandBus]);

  const onSelectTravelMode = useCallback(
    (mode: TravelMode) => {
      commandBus.emit(tripCommands.travelModeSelected(mode));
    },
    [commandBus]
  );

  const onSelectHintActivity = useCallback((activityId: string) => {
    setFocusedActivityId(activityId);
  }, []);

  const onClearFocusedActivity = useCallback(() => {
    setFocusedActivityId(null);
  }, []);

  useEffect(() => {
    commandBus.emit(tripCommands.pageOpened(defaultTripId));
  }, [commandBus]);

  useEffect(() => {
    setFocusedActivityId(null);
  }, [currentDayId]);

  return {
    headerModel,
    dateStripModel,
    mapModel,
    currentCardModel,
    focusedActivityId,
    isLoading,
    errorMessage,
    navigationPlanWarning,
    decisionHintsWarning,
    onSwitchDay,
    onSelectMapPoint,
    onSelectTravelMode,
    onSelectHintActivity,
    onClearFocusedActivity
  };
};
