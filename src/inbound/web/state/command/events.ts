export const TRIP_UI_COMMANDS = {
  pageOpened: "page-opened",
  daySelected: "day-selected",
  mapPointSelected: "map-point-selected",
  travelModeSelected: "travel-mode-selected"
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
      type: (typeof TRIP_UI_COMMANDS)["travelModeSelected"];
      mode: "walk" | "transit" | "drive";
    };

export type TripUiCommandType = TripUiCommand["type"];
