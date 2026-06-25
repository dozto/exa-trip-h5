import type { RouteStrategy } from "../../../../domains/trip-navigation/route-plan";

export const TRIP_UI_COMMANDS = {
  pageOpened: "page-opened",
  daySelected: "day-selected",
  mapPointSelected: "map-point-selected",
  strategySelected: "strategy-selected",
  placeSelected: "place-selected",
  viewEscaped: "view-escaped"
} as const;

export type TripUiCommand =
  | {
      type: (typeof TRIP_UI_COMMANDS)["pageOpened"];
      tripId: string;
    }
  | {
      type: (typeof TRIP_UI_COMMANDS)["daySelected"];
      dayId: string;
    }
  | {
      type: (typeof TRIP_UI_COMMANDS)["mapPointSelected"];
      dayId: string;
    }
  | {
      type: (typeof TRIP_UI_COMMANDS)["strategySelected"];
      strategy: RouteStrategy;
    }
  | {
      type: (typeof TRIP_UI_COMMANDS)["placeSelected"];
      placeId: string;
    }
  | {
      type: (typeof TRIP_UI_COMMANDS)["viewEscaped"];
    };

export type TripUiCommandType = TripUiCommand["type"];