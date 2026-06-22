export type AppErrorCode =
  | "trip_not_found"
  | "trip_invalid_schema"
  | "trip_load_failed";

export type AppError = {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
};
