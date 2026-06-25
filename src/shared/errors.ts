export type AppErrorCode =
  | "trip_not_found"
  | "trip_invalid_schema"
  | "trip_load_failed"
  | "day_switch_failed"
  | "navigation_plan_failed";

export type AppError = {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
};
