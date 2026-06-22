import type { TripDay, TripPlan } from "../../../../domains/trip-planning/trip-plan";
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
  x: number;
  y: number;
  isActive: boolean;
};

export type TripMapViewModel = {
  title: string;
  subtitle: string;
  points: TripMapPointViewModel[];
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
  currentDayId: string | null
): TripMapViewModel => {
  const points = selectMapPoints(tripPlan, currentDayId);
  return {
    title: tripPlan ? "Map Navigation" : "Map",
    subtitle: tripPlan ? `${tripPlan.days.length} 天行程 · 地点导航` : "加载地图中",
    points,
    activeDayId: selectActiveDayId(tripPlan, currentDayId)
  };
};

export const buildTripCurrentCardModel = (
  tripPlan: TripPlan | null,
  currentDay: TripDay | null,
  tipsModel: TripTipsViewModel
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
    items
  };
};
