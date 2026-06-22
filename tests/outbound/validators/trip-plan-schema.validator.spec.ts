import { describe, expect, it } from "vitest";
import validExample from "../../../contracts/itinerary.v1.example.json";
import { TripPlanSchemaZodValidator } from "../../../src/outbound/validators/trip-plan-schema.validator";

describe("TripPlanSchemaZodValidator", () => {
  it("accepts valid trip plan JSON", () => {
    const validator = new TripPlanSchemaZodValidator();

    const result = validator.validate(validExample);

    expect(result.ok).toBe(true);
  });

  it("rejects invalid trip plan JSON", () => {
    const validator = new TripPlanSchemaZodValidator();
    const invalid = {
      ...validExample,
      days: [
        {
          ...validExample.days[0],
          items: [
            {
              ...validExample.days[0].items[0],
              durationMinutes: 0
            }
          ]
        }
      ]
    };

    const result = validator.validate(invalid);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});
