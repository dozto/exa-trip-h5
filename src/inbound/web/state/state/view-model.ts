import type { TripDay, TripPlan } from "../../../../domains/trip-planning/trip-plan";
import type { DayDecisionHints, NavigationPlan, TravelMode } from "../../../../domains/trip-navigation/route-plan";
import { formatDateLabel, formatDuration } from "../../../../shared/time";
import { selectActiveDayId, selectMapPoints } from "./selectors";

export type TripHeaderViewModel = {
  title: string;
  subtitle: string;
};

export type TripTipsViewModel = {
  preparations: string[];
  suggestions: string[];
};

export type TripDateItemViewModel = {
  dayId: string;
  dayLabel: string;
  dateLabel: string;
  cityLabel: string;
  isActive: boolean;
};

export type TripDateStripViewModel = {
  items: TripDateItemViewModel[];
};

export type TripMapPointViewModel = {
  pointId: string;
  dayId: string;
  label: string;
  address: string;
  lat: number | null;
  lng: number | null;
  x: number;
  y: number;
  isActive: boolean;
};

export type TripMapViewModel = {
  title: string;
  subtitle: string;
  points: TripMapPointViewModel[];
  routeCoordinates: [number, number][];
  selectedTravelMode: TravelMode;
  routeSummary: {
    durationMinutes: number;
    distanceKm: number;
    updatedAt: string;
    isFallback: boolean;
  } | null;
  decisionHintSummary: {
    activityId: string;
    recommendedDepartureTime: string | null;
    latenessRiskLevel: "low" | "medium" | "high";
    feasibility: "feasible" | "tight" | "infeasible" | null;
  } | null;
  activeDayId: string | null;
};

export type TripCardItemViewModel = {
  itemId: string;
  title: string;
  content: string;
  timeLabel: string;
  durationLabel: string;
  locationLabel: string;
};

export type TripCurrentCardViewModel = {
  dayId: string;
  dayLabel: string;
  dateLabel: string;
  cityLabel: string;
  summary: string;
  primaryLocation: string;
  preparations: string[];
  suggestions: string[];
  decisionHints: string[];
  items: TripCardItemViewModel[];
};

const buildItemTimeLabel = (
  startTime: string | undefined,
  endTime: string | undefined
): string => {
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }
  return "时间待定";
};

export const buildTripHeaderModel = (tripPlan: TripPlan | null): TripHeaderViewModel => {
  if (!tripPlan) {
    return {
      title: "行程加载中",
      subtitle: "正在从 mock 数据加载行程，请稍候。"
    };
  }

  return {
    title: tripPlan.title,
    subtitle: `${tripPlan.startDate} - ${tripPlan.endDate} · ${tripPlan.timezone}`
  };
};

export const buildTripTipsModel = (
  tripPlan: TripPlan | null,
  currentDay: TripDay | null
): TripTipsViewModel => {
  const preparations =
    currentDay?.preparations?.map((item) => item.title) ??
    tripPlan?.globalPreparations?.map((item) => item.title) ??
    [];
  const suggestions =
    currentDay?.suggestions?.map((item) => item.content) ??
    tripPlan?.globalSuggestions?.map((item) => item.content) ??
    [];

  return {
    preparations,
    suggestions
  };
};

export const buildTripDateStripModel = (
  tripPlan: TripPlan | null,
  currentDayId: string | null
): TripDateStripViewModel => {
  const activeDayId = selectActiveDayId(tripPlan, currentDayId);
  const items =
    tripPlan?.days.map((day) => ({
      dayId: day.dayId,
      dayLabel: `Day ${day.dayIndex}`,
      dateLabel: formatDateLabel(day.date),
      cityLabel: day.city ?? "未命名地点",
      isActive: day.dayId === activeDayId
    })) ?? [];

  return { items };
};

export const buildTripMapModel = (
  tripPlan: TripPlan | null,
  currentDayId: string | null,
  navigationPlan: NavigationPlan | null,
  dayDecisionHints: DayDecisionHints | null,
  selectedTravelMode: TravelMode
): TripMapViewModel => {
  const points = selectMapPoints(tripPlan, currentDayId);
  const routeCoordinates: [number, number][] = [];
  let durationMinutes = 0;
  let distanceKm = 0;

  if (navigationPlan) {
    for (const leg of navigationPlan.legs) {
      const option = leg.options.find((item) => item.mode === selectedTravelMode);
      if (!option) {
        continue;
      }
      durationMinutes += option.durationMinutes;
      distanceKm += option.distanceKm;
      if (routeCoordinates.length === 0) {
        routeCoordinates.push(...option.geometry);
      } else if (option.geometry.length > 1) {
        routeCoordinates.push(...option.geometry.slice(1));
      }
    }
  }

  const routeSummary =
    navigationPlan && durationMinutes > 0
      ? {
          durationMinutes,
          distanceKm: Math.round(distanceKm * 10) / 10,
          updatedAt: navigationPlan.updatedAt,
          isFallback: navigationPlan.isFallback
        }
      : null;

  const firstHintWithDeparture =
    dayDecisionHints?.eventEstimates.find((item) => typeof item.recommendedDepartureTime === "string") ??
    dayDecisionHints?.eventEstimates[0];
  const strongestFeasibility: "feasible" | "tight" | "infeasible" | null =
    dayDecisionHints?.feasibilityAssessments.some((item) => item.feasibility === "infeasible")
      ? "infeasible"
      : dayDecisionHints?.feasibilityAssessments.some((item) => item.feasibility === "tight")
        ? "tight"
        : dayDecisionHints && dayDecisionHints.feasibilityAssessments.length > 0
          ? "feasible"
          : null;

  const decisionHintSummary = firstHintWithDeparture
    ? {
        activityId: firstHintWithDeparture.activityId,
        recommendedDepartureTime: firstHintWithDeparture.recommendedDepartureTime ?? null,
        latenessRiskLevel: firstHintWithDeparture.latenessRiskLevel,
        feasibility: strongestFeasibility
      }
    : null;

  return {
    title: tripPlan ? "Map Navigation" : "Map",
    subtitle: tripPlan ? `${tripPlan.days.length} 天行程 · 地点导航` : "加载地图中",
    points,
    routeCoordinates,
    selectedTravelMode,
    routeSummary,
    decisionHintSummary,
    activeDayId: selectActiveDayId(tripPlan, currentDayId)
  };
};

export const buildTripCurrentCardModel = (
  tripPlan: TripPlan | null,
  currentDay: TripDay | null,
  tipsModel: TripTipsViewModel,
  dayDecisionHints: DayDecisionHints | null
): TripCurrentCardViewModel | null => {
  if (!tripPlan || !currentDay) {
    return null;
  }

  const items = currentDay.items.map((item) => ({
    itemId: item.itemId,
    title: item.title,
    content: item.content,
    timeLabel: buildItemTimeLabel(item.startTime, item.endTime),
    durationLabel: formatDuration(item.durationMinutes),
    locationLabel: item.placeId
      ? tripPlan.places[item.placeId]?.name ?? "地点待补充"
      : "地点待定"
  }));

  const firstLocation = currentDay.items.find((item) => item.placeId)?.placeId;

  const decisionHints = dayDecisionHints
    ? [
        ...dayDecisionHints.eventEstimates.slice(0, 2).map((item) => {
          const departure = item.recommendedDepartureTime
            ? `建议 ${item.recommendedDepartureTime} 出发`
            : "建议预留弹性出发时间";
          return `${departure} · 迟到风险 ${item.latenessRiskLevel}`;
        }),
        ...dayDecisionHints.feasibilityAssessments
          .filter((item) => item.feasibility !== "feasible")
          .slice(0, 1)
          .map((item) => item.adjustmentSuggestion)
      ]
    : [];

  return {
    dayId: currentDay.dayId,
    dayLabel: `Day ${currentDay.dayIndex}`,
    dateLabel: formatDateLabel(currentDay.date),
    cityLabel: currentDay.city ?? "未命名城市",
    summary: currentDay.summary ?? "行程安排",
    primaryLocation: firstLocation
      ? tripPlan.places[firstLocation]?.name ?? "地点待补充"
      : "地点待定",
    preparations: tipsModel.preparations,
    suggestions: tipsModel.suggestions,
    decisionHints,
    items
  };
};
