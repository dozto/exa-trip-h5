import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildPlaceFocusCardModel,
  buildTripCurrentCardModel,
  buildTripDateStripModel,
  buildTripHeaderModel,
  buildTripMapModel,
  buildTripOverviewModel,
  buildTripTipsModel
} from "./view-model";
import type { RouteStrategy } from "../../../../domains/trip-navigation/route-plan";
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
  const selectedStrategy = useTripViewStore((state) => state.selectedStrategy);
  const viewLevel = useTripViewStore((state) => state.viewLevel);
  const selectedPlaceId = useTripViewStore((state) => state.selectedPlaceId);

  const currentDay = useMemo(() => selectCurrentDay(tripPlan, currentDayId), [tripPlan, currentDayId]);
  const headerModel = useMemo(() => buildTripHeaderModel(tripPlan), [tripPlan]);
  const tipsModel = useMemo(() => buildTripTipsModel(tripPlan, currentDay), [tripPlan, currentDay]);
  const dateStripModel = useMemo(
    () => buildTripDateStripModel(tripPlan, currentDayId),
    [tripPlan, currentDayId]
  );
  const overviewModel = useMemo(() => buildTripOverviewModel(tripPlan), [tripPlan]);
  const mapModel = useMemo(
    () =>
      buildTripMapModel(
        tripPlan,
        currentDayId,
        navigationPlan,
        dayDecisionHints,
        selectedStrategy,
        viewLevel,
        selectedPlaceId
      ),
    [tripPlan, currentDayId, navigationPlan, dayDecisionHints, selectedStrategy, viewLevel, selectedPlaceId]
  );
  const currentCardModel = useMemo(
    () => buildTripCurrentCardModel(tripPlan, currentDay, tipsModel, dayDecisionHints, navigationPlan, selectedStrategy),
    [tripPlan, currentDay, tipsModel, dayDecisionHints, navigationPlan, selectedStrategy]
  );
  const placeFocusCardModel = useMemo(
    () =>
      buildPlaceFocusCardModel(
        tripPlan,
        currentDayId,
        selectedPlaceId,
        navigationPlan,
        dayDecisionHints,
        selectedStrategy
      ),
    [tripPlan, currentDayId, selectedPlaceId, navigationPlan, dayDecisionHints, selectedStrategy]
  );

  const onSwitchDay = useCallback((dayId: string) => {
    commandBus.emit(tripCommands.daySelected(dayId));
  }, [commandBus]);

  const onSelectMapPoint = useCallback((dayId: string) => {
    commandBus.emit(tripCommands.mapPointSelected(dayId));
  }, [commandBus]);

  const onSelectStrategy = useCallback(
    (strategy: RouteStrategy) => {
      commandBus.emit(tripCommands.strategySelected(strategy));
    },
    [commandBus]
  );

  const onSelectPlace = useCallback(
    (placeId: string) => {
      commandBus.emit(tripCommands.placeSelected(placeId));
    },
    [commandBus]
  );

  const onSelectHintActivity = useCallback((activityId: string) => {
    setFocusedActivityId(activityId);
  }, []);

  const onClearFocusedActivity = useCallback(() => {
    setFocusedActivityId(null);
  }, []);

  const onViewEscape = useCallback(() => {
    commandBus.emit(tripCommands.viewEscaped());
  }, [commandBus]);

  const onClosePlaceFocus = useCallback(() => {
    commandBus.emit(tripCommands.viewEscaped());
  }, [commandBus]);

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
    overviewModel,
    placeFocusCardModel,
    focusedActivityId,
    isLoading,
    errorMessage,
    navigationPlanWarning,
    decisionHintsWarning,
    selectedStrategy,
    viewLevel,
    selectedPlaceId,
    onSwitchDay,
    onSelectMapPoint,
    onSelectStrategy,
    onSelectPlace,
    onSelectHintActivity,
    onClearFocusedActivity,
    onViewEscape,
    onClosePlaceFocus
  };
};