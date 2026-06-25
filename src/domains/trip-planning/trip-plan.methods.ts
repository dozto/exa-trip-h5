import type {
  ActivityItem,
  Place,
  PreparationItem,
  SuggestionItem,
  TripDay,
  TripPlan
} from "./trip-plan";

export type PlanInvariantViolation = {
  code: string;
  message: string;
};

const formatDateInTimezone = (date: Date, timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

export const getDay = (plan: TripPlan, dayId: string): TripDay | null => {
  return plan.days.find((day) => day.dayId === dayId) ?? null;
};

export const getDefaultDayId = (
  plan: TripPlan,
  now: Date = new Date(),
  timezone: string = plan.timezone
): string => {
  const today = formatDateInTimezone(now, timezone);
  const matchedDay = plan.days.find((day) => day.date === today);
  return matchedDay?.dayId ?? plan.days[0]?.dayId ?? "";
};

export const listDayActivities = (plan: TripPlan, dayId: string): ActivityItem[] => {
  return getDay(plan, dayId)?.items ?? [];
};

export const buildDayPlaceSequence = (plan: TripPlan, dayId: string): Place[] => {
  const day = getDay(plan, dayId);
  if (!day) {
    return [];
  }

  const places: Place[] = [];
  let previousPlaceId: string | null = null;

  for (const item of day.items) {
    if (!item.placeId || item.placeId === previousPlaceId) {
      continue;
    }

    const place = plan.places[item.placeId];
    if (!place) {
      continue;
    }

    places.push(place);
    previousPlaceId = item.placeId;
  }

  return places;
};

const mergeUniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const map = new Map<string, T>();
  for (const item of items) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
};

export const deriveDayPreparations = (day: TripDay): PreparationItem[] => {
  const itemLevel = day.items.flatMap((item) => item.preparations ?? []);
  const dayLevel = day.preparations ?? [];
  return mergeUniqueById([...itemLevel, ...dayLevel]);
};

export const deriveDaySuggestions = (day: TripDay): SuggestionItem[] => {
  const itemLevel = day.items.flatMap((item) => item.suggestions ?? []);
  const dayLevel = day.suggestions ?? [];
  return mergeUniqueById([...itemLevel, ...dayLevel]);
};

export const assertPlanInvariants = (plan: TripPlan): PlanInvariantViolation[] => {
  const violations: PlanInvariantViolation[] = [];

  if (plan.days.length < 1) {
    violations.push({
      code: "plan_days_empty",
      message: "Trip plan must include at least one day"
    });
  }

  if (plan.startDate > plan.endDate) {
    violations.push({
      code: "plan_date_range_invalid",
      message: "Trip plan startDate must be before or equal to endDate"
    });
  }

  const dayIndexes = new Set<number>();
  const dates = new Set<string>();

  for (const day of plan.days) {
    if (dayIndexes.has(day.dayIndex)) {
      violations.push({
        code: "day_index_duplicated",
        message: `Duplicate dayIndex found: ${day.dayIndex}`
      });
    }
    dayIndexes.add(day.dayIndex);

    if (dates.has(day.date)) {
      violations.push({
        code: "day_date_duplicated",
        message: `Duplicate day date found: ${day.date}`
      });
    }
    dates.add(day.date);

    if (day.date < plan.startDate || day.date > plan.endDate) {
      violations.push({
        code: "day_date_out_of_plan_range",
        message: `Day date out of plan range: ${day.date}`
      });
    }

    for (const item of day.items) {
      if (item.placeId && !plan.places[item.placeId]) {
        violations.push({
          code: "activity_place_not_found",
          message: `Activity references missing place: ${item.placeId}`
        });
      }
    }
  }

  return violations;
};
