import { useCallback, useEffect, useMemo } from "react";
import {
  buildTripCurrentCardModel,
  buildTripDateStripModel,
  buildTripHeaderModel,
  buildTripMapModel,
  buildTripTipsModel
} from "./view-model";
import { tripCommands } from "../command/commands";
import { useTripModelRuntime } from "../store/runtime-context";
import { selectCurrentDay } from "./selectors";
import { useTripViewStore } from "../store/view-store";

const defaultTripId = import.meta.env.VITE_TRIP_ID ?? "trip-jp-kansai-2026-spring";

export const useItineraryPageModel = () => {
  const { commandBus } = useTripModelRuntime();
  const tripPlan = useTripViewStore((state) => state.tripPlan);
  const currentDayId = useTripViewStore((state) => state.currentDayId);
  const isLoading = useTripViewStore((state) => state.isLoading);
  const errorMessage = useTripViewStore((state) => state.errorMessage);

  const currentDay = useMemo(() => selectCurrentDay(tripPlan, currentDayId), [tripPlan, currentDayId]);
  const headerModel = useMemo(() => buildTripHeaderModel(tripPlan), [tripPlan]);
  const tipsModel = useMemo(() => buildTripTipsModel(tripPlan, currentDay), [tripPlan, currentDay]);
  const dateStripModel = useMemo(
    () => buildTripDateStripModel(tripPlan, currentDayId),
    [tripPlan, currentDayId]
  );
  const mapModel = useMemo(() => buildTripMapModel(tripPlan, currentDayId), [tripPlan, currentDayId]);
  const currentCardModel = useMemo(
    () => buildTripCurrentCardModel(tripPlan, currentDay, tipsModel),
    [tripPlan, currentDay, tipsModel]
  );

  const onSwitchDay = useCallback((dayId: string) => {
    commandBus.emit(tripCommands.daySelected(dayId));
  }, [commandBus]);

  const onSelectMapPoint = useCallback((dayId: string) => {
    commandBus.emit(tripCommands.mapPointSelected(dayId));
  }, [commandBus]);

  useEffect(() => {
    commandBus.emit(tripCommands.pageOpened(defaultTripId));
  }, [commandBus]);

  return {
    headerModel,
    dateStripModel,
    mapModel,
    currentCardModel,
    isLoading,
    errorMessage,
    onSwitchDay,
    onSelectMapPoint
  };
};
