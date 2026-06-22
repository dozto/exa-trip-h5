import type { AppError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import type { TripPlan } from "../../domains/trip-planning/trip-plan";
import type {
  LoadTripPlanInput,
  LoadTripPlanOutput,
  ValidationResult
} from "./types";

export type LoadTripPlan = (
  input: LoadTripPlanInput
) => Promise<Result<LoadTripPlanOutput, AppError>>;

export interface TripPlanRepository {
  loadById(tripId: string): Promise<unknown | null>;
}

export interface TripPlanSchemaValidator {
  validate(input: unknown): ValidationResult<TripPlan>;
}

export type LoadTripPlanDependencies = {
  repository: TripPlanRepository;
  schemaValidator: TripPlanSchemaValidator;
};

export type { LoadTripPlanInput, LoadTripPlanOutput, ValidationResult };
