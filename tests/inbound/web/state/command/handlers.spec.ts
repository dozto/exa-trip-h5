import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TripPlan } from "../../../../../src/domains/trip-planning/trip-plan";
import { createTripUiCommandBus } from "../../../../../src/inbound/web/events";
import { registerTripModelHandlers } from "../../../../../src/inbound/web/state/command/handlers";
import { tripCommands } from "../../../../../src/inbound/web/state/command/commands";
import { useTripViewStore } from "../../../../../src/inbound/web/state/store/view-store";

const exampleTripPlan = {
  schemaVersion: "1.0.0",
  tripId: "trip-jp-kansai-2026-spring",
  title: "Kansai",
  timezone: "Asia/Tokyo",
  startDate: "2026-03-01",
  endDate: "2026-03-03",
  days: [
    {
      dayId: "day-1",
      date: "2026-03-01",
      dayIndex: 1,
      items: [
        {
          itemId: "item-1",
          title: "Arrive",
          content: "Airport arrival",
          durationMinutes: 60
        }
      ]
    }
  ],
  places: {}
} as TripPlan;

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const initialStoreState = useTripViewStore.getState();

const exampleNavigationPlan = {
  dayId: "day-1",
  legs: [],
  updatedAt: "2026-03-01T00:00:00.000Z",
  isFallback: false
};

const exampleDecisionHints = {
  dayId: "day-1",
  eventEstimates: [
    {
      activityId: "item-1",
      suggestedBufferMinutes: 15,
      latenessRiskLevel: "low" as const,
      overrunRiskLevel: "low" as const,
      travelMinutes: 0
    }
  ],
  feasibilityAssessments: [],
  updatedAt: "2026-03-01T00:00:00.000Z"
};

describe("registerTripModelHandlers", () => {
  beforeEach(() => {
    useTripViewStore.setState(initialStoreState, true);
  });

  afterEach(() => {
    useTripViewStore.setState(initialStoreState, true);
  });

  it("handles page-opened success and updates loading lifecycle", async () => {
    const commandBus = createTripUiCommandBus();
    const loadTripPlan = vi.fn(async () => ({
      ok: true as const,
      value: {
        tripPlan: exampleTripPlan,
        currentDayId: "day-1"
      }
    }));
    const switchCurrentDay = vi.fn();
    const planTripRoutes = vi.fn(async () => ({
      ok: true as const,
      value: exampleNavigationPlan
    }));
    const showDayDecisionHints = vi.fn(async () => ({
      ok: true as const,
      value: exampleDecisionHints
    }));

    const stop = registerTripModelHandlers({
      commandBus,
      loadTripPlan,
      switchCurrentDay,
      planTripRoutes,
      showDayDecisionHints
    });

    commandBus.emit(tripCommands.pageOpened("trip-jp-kansai-2026-spring"));
    await flush();

    const state = useTripViewStore.getState();
    expect(loadTripPlan).toHaveBeenCalledWith({ tripId: "trip-jp-kansai-2026-spring" });
    expect(state.tripPlan?.tripId).toBe("trip-jp-kansai-2026-spring");
    expect(state.currentDayId).toBe("day-1");
    expect(state.isLoading).toBe(false);
    expect(state.errorMessage).toBeNull();
    expect(planTripRoutes).toHaveBeenCalledWith({
      tripPlan: exampleTripPlan,
      dayId: "day-1",
      modes: ["drive"]
    });
    expect(showDayDecisionHints).toHaveBeenCalledWith({
      tripPlan: exampleTripPlan,
      dayId: "day-1",
      navigationPlan: exampleNavigationPlan,
      defaultBufferMinutes: 15
    });

    stop();
  });

  it("handles page-opened failure and stores error message", async () => {
    const commandBus = createTripUiCommandBus();
    const loadTripPlan = vi.fn(async () => ({
      ok: false as const,
      error: {
        code: "trip_load_failed" as const,
        message: "load failed"
      }
    }));
    const switchCurrentDay = vi.fn();
    const planTripRoutes = vi.fn();
    const showDayDecisionHints = vi.fn();

    const stop = registerTripModelHandlers({
      commandBus,
      loadTripPlan,
      switchCurrentDay,
      planTripRoutes,
      showDayDecisionHints
    });

    commandBus.emit(tripCommands.pageOpened("trip-jp-kansai-2026-spring"));
    await flush();

    const state = useTripViewStore.getState();
    expect(state.errorMessage).toBe("load failed");
    expect(state.tripPlan).toBeNull();
    expect(state.isLoading).toBe(false);

    stop();
  });

  it("handles day switch failure from both day and map commands", async () => {
    const commandBus = createTripUiCommandBus();
    const loadTripPlan = vi.fn(async () => ({
      ok: true as const,
      value: {
        tripPlan: exampleTripPlan,
        currentDayId: "day-1"
      }
    }));
    const switchCurrentDay = vi.fn(async () => ({
      ok: false as const,
      error: {
        code: "trip_load_failed" as const,
        message: "switch failed"
      }
    }));
    const planTripRoutes = vi.fn();
    const showDayDecisionHints = vi.fn();

    const stop = registerTripModelHandlers({
      commandBus,
      loadTripPlan,
      switchCurrentDay,
      planTripRoutes,
      showDayDecisionHints
    });

    commandBus.emit(tripCommands.daySelected("day-2"));
    commandBus.emit(tripCommands.mapPointSelected("day-3"));
    await flush();

    expect(switchCurrentDay).toHaveBeenNthCalledWith(1, { dayId: "day-2" });
    expect(switchCurrentDay).toHaveBeenNthCalledWith(2, { dayId: "day-3" });
    expect(useTripViewStore.getState().errorMessage).toBe("switch failed");

    stop();
  });

  it("refreshes route plan when travel mode changes", async () => {
    const commandBus = createTripUiCommandBus();
    const loadTripPlan = vi.fn();
    const switchCurrentDay = vi.fn();
    const planTripRoutes = vi.fn(async () => ({
      ok: true as const,
      value: exampleNavigationPlan
    }));
    const showDayDecisionHints = vi.fn(async () => ({
      ok: true as const,
      value: exampleDecisionHints
    }));

    useTripViewStore.setState(
      {
        ...useTripViewStore.getState(),
        tripPlan: exampleTripPlan,
        currentDayId: "day-1",
        selectedTravelMode: "drive"
      },
      true
    );

    const stop = registerTripModelHandlers({
      commandBus,
      loadTripPlan,
      switchCurrentDay,
      planTripRoutes,
      showDayDecisionHints
    });

    commandBus.emit(tripCommands.travelModeSelected("walk"));
    await flush();

    expect(planTripRoutes).toHaveBeenCalledWith({
      tripPlan: exampleTripPlan,
      dayId: "day-1",
      modes: ["walk"]
    });
    expect(showDayDecisionHints).toHaveBeenCalledWith({
      tripPlan: exampleTripPlan,
      dayId: "day-1",
      navigationPlan: exampleNavigationPlan,
      defaultBufferMinutes: 15
    });
    expect(useTripViewStore.getState().selectedTravelMode).toBe("walk");

    stop();
  });
});
