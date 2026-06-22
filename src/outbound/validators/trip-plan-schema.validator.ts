import type { ZodIssue } from "zod";
import { tripPlanSchema, type TripPlan } from "../../domains/trip-planning/trip-plan";
import type {
  TripPlanSchemaValidator,
  ValidationResult
} from "../../features/load-trip-plan/port";

const formatIssue = (issue: ZodIssue): string => {
  const path = issue.path.length === 0 ? "/" : `/${issue.path.join("/")}`;
  return `${path} ${issue.message}`;
};

export class TripPlanSchemaZodValidator implements TripPlanSchemaValidator {
  validate(input: unknown): ValidationResult<TripPlan> {
    const parsed = tripPlanSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          message: "Trip schema validation failed",
          issues: parsed.error.issues.map(formatIssue)
        }
      };
    }

    return {
      ok: true,
      value: parsed.data
    };
  }
}
