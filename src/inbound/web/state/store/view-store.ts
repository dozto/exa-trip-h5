import { create } from "zustand";
import type { TripPlan } from "../../../../domains/trip-planning/trip-plan";

export type TripViewState = {
  tripPlan: TripPlan | null;
  currentDayId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  loadStarted: () => void;
  loadSucceeded: (tripPlan: TripPlan, currentDayId: string) => void;
  loadFailed: (message: string) => void;
  daySwitchSucceeded: (dayId: string) => void;
  daySwitchFailed: (message: string) => void;
};

export const useTripViewStore = create<TripViewState>((set) => ({
  tripPlan: null,
  currentDayId: null,
  isLoading: false,
  errorMessage: null,
  loadStarted: () =>
    set({
      isLoading: true,
      errorMessage: null
    }),
  loadSucceeded: (tripPlan, currentDayId) =>
    set({
      tripPlan,
      currentDayId,
      isLoading: false,
      errorMessage: null
    }),
  loadFailed: (errorMessage) =>
    set({
      isLoading: false,
      errorMessage
    }),
  daySwitchSucceeded: (currentDayId) =>
    set({
      currentDayId,
      errorMessage: null
    }),
  daySwitchFailed: (errorMessage) =>
    set({
      errorMessage
    })
}));
