import { createContext, useContext } from "react";
import type { TripUiCommandBus } from "../../events";

export type TripModelRuntime = {
  commandBus: TripUiCommandBus;
  dispose: () => void;
};

export const TripModelRuntimeContext = createContext<TripModelRuntime | null>(null);

export const useTripModelRuntime = (): TripModelRuntime => {
  const runtime = useContext(TripModelRuntimeContext);
  if (!runtime) {
    throw new Error("TripModelRuntimeContext is not provided");
  }

  return runtime;
};
