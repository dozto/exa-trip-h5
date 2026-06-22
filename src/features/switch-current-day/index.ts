import type { AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result";
import type { SwitchCurrentDay, SwitchCurrentDayInput, SwitchCurrentDayOutput } from "./port";

export const switchCurrentDay: SwitchCurrentDay = async (
  input: SwitchCurrentDayInput
): Promise<Result<SwitchCurrentDayOutput, AppError>> => {
  if (!input.dayId) {
    return err({
      code: "trip_load_failed",
      message: "Day id is required"
    });
  }
  return ok({ currentDayId: input.dayId });
};
