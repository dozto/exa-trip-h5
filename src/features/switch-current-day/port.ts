import type { AppError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import type { SwitchCurrentDayInput, SwitchCurrentDayOutput } from "./types";

export type SwitchCurrentDay = (
  input: SwitchCurrentDayInput
) => Promise<Result<SwitchCurrentDayOutput, AppError>>;

export type { SwitchCurrentDayInput, SwitchCurrentDayOutput };
