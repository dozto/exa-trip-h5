import { create } from "zustand";
import type { DayDecisionHints, NavigationPlan, RouteStrategy } from "../../../../domains/trip-navigation/route-plan";
import type { TripPlan } from "../../../../domains/trip-planning/trip-plan";

type ViewLevel = "overview" | "day" | "place";

export type TripViewState = {
  tripPlan: TripPlan | null;
  currentDayId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  navigationPlan: NavigationPlan | null;
  dayDecisionHints: DayDecisionHints | null;
  selectedStrategy: RouteStrategy;
  viewLevel: ViewLevel;
  selectedPlaceId: string | null;
  navigationPlanWarning: string | null;
  decisionHintsWarning: string | null;
  loadStarted: () => void;
  loadSucceeded: (tripPlan: TripPlan, currentDayId: string) => void;
  loadFailed: (message: string) => void;
  daySwitchSucceeded: (dayId: string) => void;
  daySwitchFailed: (message: string) => void;
  strategySelected: (strategy: RouteStrategy) => void;
  placeSelected: (placeId: string) => void;
  goToDayView: () => void;
  goToOverview: () => void;
  navigationPlanSucceeded: (navigationPlan: NavigationPlan | null) => void;
  navigationPlanFailed: (message: string) => void;
  decisionHintsSucceeded: (hints: DayDecisionHints | null) => void;
  decisionHintsFailed: (message: string) => void;
};

export const useTripViewStore = create<TripViewState>((set) => ({
  tripPlan: null,
  currentDayId: null,
  isLoading: false,
  errorMessage: null,
  navigationPlan: null,
  dayDecisionHints: null,
  selectedStrategy: "fastest",
  viewLevel: "day",
  selectedPlaceId: null,
  navigationPlanWarning: null,
  decisionHintsWarning: null,
  loadStarted: () =>
    set({
      isLoading: true,
      errorMessage: null,
      navigationPlanWarning: null,
      decisionHintsWarning: null
    }),
  loadSucceeded: (tripPlan, currentDayId) =>
    set({
      tripPlan,
      currentDayId,
      isLoading: false,
      errorMessage: null,
      navigationPlanWarning: null,
      decisionHintsWarning: null,
      dayDecisionHints: null,
      viewLevel: "day",
      selectedPlaceId: null
    }),
  loadFailed: (errorMessage) =>
    set({
      isLoading: false,
      errorMessage
    }),
  daySwitchSucceeded: (currentDayId) =>
    set({
      currentDayId,
      errorMessage: null,
      dayDecisionHints: null,
      decisionHintsWarning: null,
      viewLevel: "day",
      selectedPlaceId: null
    }),
  daySwitchFailed: (errorMessage) =>
    set({
      errorMessage
    }),
  strategySelected: (selectedStrategy) => set({ selectedStrategy }),
  placeSelected: (placeId) =>
    set({ viewLevel: "place", selectedPlaceId: placeId }),
  goToDayView: () => set({ viewLevel: "day", selectedPlaceId: null }),
  goToOverview: () => set({ viewLevel: "overview", selectedPlaceId: null, currentDayId: null, dayDecisionHints: null }),
  navigationPlanSucceeded: (navigationPlan) =>
    set({
      navigationPlan,
      navigationPlanWarning: navigationPlan?.isFallback ? "实时路线已降级为缓存" : null
    }),
  navigationPlanFailed: (message) =>
    set({
      navigationPlanWarning: message
    }),
  decisionHintsSucceeded: (dayDecisionHints) =>
    set({
      dayDecisionHints,
      decisionHintsWarning: null
    }),
  decisionHintsFailed: (message) =>
    set({
      decisionHintsWarning: message
    })
}));