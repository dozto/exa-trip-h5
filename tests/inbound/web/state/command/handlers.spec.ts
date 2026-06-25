import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TripPlan } from "../../../../../src/domains/trip-planning/trip-plan";
import type { NavigationPlan, DayDecisionHints } from "../../../../../src/domains/trip-navigation/route-plan";
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
  places: {
    "place-a": { placeId: "place-a", name: "A", lat: 0, lng: 0 }
  }
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
} as NavigationPlan;

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
} as DayDecisionHints;

const createDeps = () => {
  const loadTripPlan: ReturnType<typeof vi.fn> = vi.fn(async () => ({
    ok: true as const,
    value: { tripPlan: exampleTripPlan, currentDayId: "day-1" }
  }));
  const switchCurrentDay: ReturnType<typeof vi.fn> = vi.fn();
  const planTripRoutes: ReturnType<typeof vi.fn> = vi.fn(async () => ({
    ok: true as const,
    value: exampleNavigationPlan
  }));
  const showDayDecisionHints: ReturnType<typeof vi.fn> = vi.fn(async () => ({
    ok: true as const,
    value: exampleDecisionHints
  }));
  return { loadTripPlan, switchCurrentDay, planTripRoutes, showDayDecisionHints };
};

describe("registerTripModelHandlers", () => {
  beforeEach(() => {
    useTripViewStore.setState(initialStoreState, true);
  });

  afterEach(() => {
    useTripViewStore.setState(initialStoreState, true);
  });

  it("handles page-opened success and plans routes by default strategy", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.pageOpened("trip-jp-kansai-2026-spring"));
    await flush();

    const state = useTripViewStore.getState();
    expect(deps.loadTripPlan).toHaveBeenCalledWith({ tripId: "trip-jp-kansai-2026-spring" });
    expect(state.tripPlan?.tripId).toBe("trip-jp-kansai-2026-spring");
    expect(state.currentDayId).toBe("day-1");
    expect(state.isLoading).toBe(false);
    expect(state.viewLevel).toBe("day");
    expect(deps.planTripRoutes).toHaveBeenCalledWith({
      tripPlan: exampleTripPlan,
      dayId: "day-1"
    });
    expect(deps.showDayDecisionHints).toHaveBeenCalledWith({
      tripPlan: exampleTripPlan,
      dayId: "day-1",
      navigationPlan: exampleNavigationPlan,
      strategy: "fastest",
      defaultBufferMinutes: 15
    });

    stop();
  });

  it("handles page-opened failure and stores error message", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();
    deps.loadTripPlan = vi.fn(async () => ({
      ok: false as const,
      error: { code: "trip_load_failed" as const, message: "load failed" }
    }));

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.pageOpened("trip-jp-kansai-2026-spring"));
    await flush();

    const state = useTripViewStore.getState();
    expect(state.errorMessage).toBe("load failed");
    expect(state.tripPlan).toBeNull();
    expect(state.isLoading).toBe(false);

    stop();
  });

  it("handles day switch failure from day and map commands", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();
    deps.switchCurrentDay = vi.fn(async () => ({
      ok: false as const,
      error: { code: "day_switch_failed" as const, message: "switch failed" }
    }));

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.daySelected("day-2"));
    commandBus.emit(tripCommands.mapPointSelected("day-3"));
    await flush();

    expect(deps.switchCurrentDay).toHaveBeenNthCalledWith(1, { dayId: "day-2" });
    expect(deps.switchCurrentDay).toHaveBeenNthCalledWith(2, { dayId: "day-3" });
    expect(useTripViewStore.getState().errorMessage).toBe("switch failed");

    stop();
  });

  it("updates selected strategy without re-planning routes", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();

    useTripViewStore.setState(
      {
        ...useTripViewStore.getState(),
        tripPlan: exampleTripPlan,
        currentDayId: "day-1",
        selectedStrategy: "fastest"
      },
      true
    );

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.strategySelected("comfort"));
    await flush();

    expect(deps.planTripRoutes).not.toHaveBeenCalled();
    expect(useTripViewStore.getState().selectedStrategy).toBe("comfort");

    stop();
  });

  it("placeSelected sets viewLevel to place without planning routes", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();

    useTripViewStore.setState(
      {
        ...useTripViewStore.getState(),
        tripPlan: exampleTripPlan,
        currentDayId: "day-1",
        viewLevel: "day"
      },
      true
    );

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.placeSelected("place-a"));
    await flush();

    const state = useTripViewStore.getState();
    expect(state.viewLevel).toBe("place");
    expect(state.selectedPlaceId).toBe("place-a");
    expect(deps.planTripRoutes).not.toHaveBeenCalled();

    stop();
  });

  it("viewEscaped steps back place -> day and clears selectedPlaceId", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();

    useTripViewStore.setState(
      {
        ...useTripViewStore.getState(),
        tripPlan: exampleTripPlan,
        currentDayId: "day-1",
        viewLevel: "place",
        selectedPlaceId: "place-a"
      },
      true
    );

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.viewEscaped());
    await flush();

    const state = useTripViewStore.getState();
    expect(state.viewLevel).toBe("day");
    expect(state.selectedPlaceId).toBeNull();

    stop();
  });

  it("viewEscaped steps back day -> overview and clears currentDayId", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();

    useTripViewStore.setState(
      {
        ...useTripViewStore.getState(),
        tripPlan: exampleTripPlan,
        currentDayId: "day-1",
        viewLevel: "day"
      },
      true
    );

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.viewEscaped());
    await flush();

    const state = useTripViewStore.getState();
    expect(state.viewLevel).toBe("overview");
    expect(state.currentDayId).toBeNull();

    stop();
  });

  it("viewEscaped has no effect when already in overview", async () => {
    const commandBus = createTripUiCommandBus();
    const deps = createDeps();

    useTripViewStore.setState(
      {
        ...useTripViewStore.getState(),
        tripPlan: exampleTripPlan,
        currentDayId: null,
        viewLevel: "overview"
      },
      true
    );

    const stop = registerTripModelHandlers({
      commandBus,
      store: useTripViewStore,
      ...deps
    });

    commandBus.emit(tripCommands.viewEscaped());
    await flush();

    const state = useTripViewStore.getState();
    expect(state.viewLevel).toBe("overview");

    stop();
  });
});