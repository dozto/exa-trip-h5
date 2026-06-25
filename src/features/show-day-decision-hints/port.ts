import type { AppError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import type { ShowDayDecisionHintsInput, ShowDayDecisionHintsOutput } from "./types";

export type ShowDayDecisionHints = (
  input: ShowDayDecisionHintsInput
) => Promise<Result<ShowDayDecisionHintsOutput, AppError>>;

export type ShowDayDecisionHintsDependencies = {
  now?: () => Date;
};

export type { ShowDayDecisionHintsInput, ShowDayDecisionHintsOutput };
