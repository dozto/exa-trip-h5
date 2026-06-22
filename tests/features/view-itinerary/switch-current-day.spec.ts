import { describe, expect, it } from "vitest";
import { switchCurrentDay } from "../../../src/features/switch-current-day";

describe("switchCurrentDay", () => {
  it("returns current day id when input is valid", async () => {
    const result = await switchCurrentDay({ dayId: "day-2" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.currentDayId).toBe("day-2");
    }
  });

  it("returns failure when day id is missing", async () => {
    const result = await switchCurrentDay({ dayId: "" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("trip_load_failed");
      expect(result.error.message).toContain("Day id is required");
    }
  });
});
