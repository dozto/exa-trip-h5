import { describe, expect, it, vi } from "vitest";
import { createTripUiCommandBus } from "../../../../src/inbound/web/events";
import { TRIP_UI_COMMANDS } from "../../../../src/inbound/web/state/command/events";

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("createTripUiCommandBus", () => {
  it("notifies subscriber when command is emitted", async () => {
    const bus = createTripUiCommandBus();
    const handler = vi.fn();

    const stop = bus.on(TRIP_UI_COMMANDS.daySelected, handler);
    bus.emit({ type: TRIP_UI_COMMANDS.daySelected, dayId: "day-2" });
    await flush();

    expect(handler).toHaveBeenCalledWith({
      type: TRIP_UI_COMMANDS.daySelected,
      dayId: "day-2"
    });

    stop();
  });

  it("routes async handler errors to onError", async () => {
    const onError = vi.fn();
    const bus = createTripUiCommandBus({ onError });

    bus.on(TRIP_UI_COMMANDS.pageOpened, async () => {
      throw new Error("handler failed");
    });

    const command = { type: TRIP_UI_COMMANDS.pageOpened, tripId: "trip-a" };
    bus.emit(command);
    await flush();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), command);
  });
});
