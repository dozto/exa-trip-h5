import type { RouteStrategy } from "../../../../domains/trip-navigation/route-plan";
import type { TripUiCommand } from "./events";
import { TRIP_UI_COMMANDS } from "./events";

export const tripCommands = {
  pageOpened: (tripId: string): TripUiCommand => ({
    type: TRIP_UI_COMMANDS.pageOpened,
    tripId
  }),
  daySelected: (dayId: string): TripUiCommand => ({
    type: TRIP_UI_COMMANDS.daySelected,
    dayId
  }),
  mapPointSelected: (dayId: string): TripUiCommand => ({
    type: TRIP_UI_COMMANDS.mapPointSelected,
    dayId
  }),
  strategySelected: (strategy: RouteStrategy): TripUiCommand => ({
    type: TRIP_UI_COMMANDS.strategySelected,
    strategy
  }),
  placeSelected: (placeId: string): TripUiCommand => ({
    type: TRIP_UI_COMMANDS.placeSelected,
    placeId
  }),
  viewEscaped: (): TripUiCommand => ({
    type: TRIP_UI_COMMANDS.viewEscaped
  })
};