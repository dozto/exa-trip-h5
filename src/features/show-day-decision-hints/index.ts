import { getDay, listDayActivities } from "../../domains/trip-planning/trip-plan";
import {
  assessDayFeasibility,
  estimateEventRisk,
  selectOptionByStrategy
} from "../../domains/trip-navigation/route-plan";
import { err, ok, type Result } from "../../shared/result";
import type { AppError } from "../../shared/errors";
import type {
  ShowDayDecisionHints,
  ShowDayDecisionHintsDependencies,
  ShowDayDecisionHintsInput,
  ShowDayDecisionHintsOutput
} from "./port";

const parseMinutes = (time?: string): number | null => {
  if (!time) {
    return null;
  }
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
};

export const createShowDayDecisionHints = (
  deps: ShowDayDecisionHintsDependencies = {}
): ShowDayDecisionHints => {
  const now = deps.now ?? (() => new Date());

  return async (
    input: ShowDayDecisionHintsInput
  ): Promise<Result<ShowDayDecisionHintsOutput, AppError>> => {
    const day = getDay(input.tripPlan, input.dayId);
    if (!day) {
      return err({
        code: "trip_load_failed",
        message: `Day not found: ${input.dayId}`
      });
    }

    const activities = listDayActivities(input.tripPlan, input.dayId);
    const bufferMinutes = Math.max(0, input.defaultBufferMinutes ?? 15);

    const eventEstimates = activities.map((activity, index) => {
      let travelMinutes = 0;
      if (index > 0) {
        const previous = activities[index - 1];
        if (previous?.placeId && activity.placeId && previous.placeId !== activity.placeId) {
          const leg = input.navigationPlan.legs.find(
            (item) => item.fromPlaceId === previous.placeId && item.toPlaceId === activity.placeId
          );
          const selected = selectOptionByStrategy(leg?.options ?? [], input.strategy ?? "fastest");
          travelMinutes = selected?.durationMinutes ?? 0;
        }
      }

      return estimateEventRisk({
        activityId: activity.itemId,
        startTime: activity.startTime,
        travelMinutes,
        bufferMinutes
      });
    });

    const feasibility = assessDayFeasibility(
      activities.slice(1).map((activity, index) => {
        const previous = activities[index];
        const currentEstimate = eventEstimates[index + 1];
        const availableMinutes = (() => {
          const previousEnd = parseMinutes(previous?.endTime);
          const currentStart = parseMinutes(activity.startTime);
          if (typeof previousEnd !== "number" || typeof currentStart !== "number") {
            return undefined;
          }
          return currentStart - previousEnd;
        })();

        return {
          fromActivityId: previous?.itemId ?? "unknown",
          toActivityId: activity.itemId,
          requiredMinutes:
            (currentEstimate?.travelMinutes ?? 0) + (currentEstimate?.suggestedBufferMinutes ?? bufferMinutes),
          availableMinutes
        };
      })
    );

    return ok({
      dayId: day.dayId,
      eventEstimates,
      feasibilityAssessments: feasibility,
      updatedAt: now().toISOString()
    });
  };
};
