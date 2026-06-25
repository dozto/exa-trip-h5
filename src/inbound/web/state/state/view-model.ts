import type { TripDay, TripPlan } from "../../../../domains/trip-planning/trip-plan";
import type {
  DayDecisionHints,
  EventEstimate,
  NavigationPlan,
  RouteLeg,
  RouteOption,
  RouteStrategy,
  TravelMode
} from "../../../../domains/trip-navigation/route-plan";
import { formatDateLabel, formatDuration } from "../../../../shared/time";
import {
  selectActiveDayId,
  selectMapPoints,
  selectOptionForLegByStrategy
} from "./selectors";

export type ViewLevel = "overview" | "day" | "place";

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
  selectedStrategy: RouteStrategy;
  viewLevel: ViewLevel;
  selectedPlaceId: string | null;
  walkOnlyDay: boolean;
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

export type TripOverviewViewModel = {
  title: string;
  dateSpanLabel: string;
  dayCount: number;
  placeCount: number;
  hint: string;
};

export type PlaceLegViewModel = {
  legId: string;
  fromPlaceId: string;
  toPlaceId: string;
  fromName: string;
  toName: string;
  durationMinutes: number;
  distanceKm: number;
  mode: TravelMode | null;
  direction: "incoming" | "outgoing";
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
  legSummaries: Array<{
    legId: string;
    fromPlaceId: string;
    toPlaceId: string;
    fromName: string;
    toName: string;
    durationMinutes: number;
    distanceKm: number;
    mode: TravelMode | null;
  }>;
};

export type PlaceFocusCardViewModel = {
  placeId: string;
  name: string;
  address: string;
  highlight: string | null;
  tip: string | null;
  incomingLeg: PlaceLegViewModel | null;
  outgoingLeg: PlaceLegViewModel | null;
  isFirstInDay: boolean;
  isLastInDay: boolean;
  eventEstimate: {
    recommendedDepartureTime: string | null;
    latenessRiskLevel: EventEstimate["latenessRiskLevel"];
    bufferMinutes: number;
    travelMinutes: number;
  } | null;
  closeHint: string;
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

const lookupPlaceName = (tripPlan: TripPlan | null, placeId: string): string => {
  return tripPlan?.places[placeId]?.name ?? placeId;
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
  return { preparations, suggestions };
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

const summarizeDecisionHint = (
  dayDecisionHints: DayDecisionHints | null
): TripMapViewModel["decisionHintSummary"] => {
  if (!dayDecisionHints) {
    return null;
  }
  const firstHintWithDeparture =
    dayDecisionHints.eventEstimates.find((item) => typeof item.recommendedDepartureTime === "string") ??
    dayDecisionHints.eventEstimates[0];
  const strongestFeasibility: "feasible" | "tight" | "infeasible" | null =
    dayDecisionHints.feasibilityAssessments.some((item) => item.feasibility === "infeasible")
      ? "infeasible"
      : dayDecisionHints.feasibilityAssessments.some((item) => item.feasibility === "tight")
        ? "tight"
        : dayDecisionHints && dayDecisionHints.feasibilityAssessments.length > 0
          ? "feasible"
          : null;

  return firstHintWithDeparture
    ? {
        activityId: firstHintWithDeparture.activityId,
        recommendedDepartureTime: firstHintWithDeparture.recommendedDepartureTime ?? null,
        latenessRiskLevel: firstHintWithDeparture.latenessRiskLevel,
        feasibility: strongestFeasibility
      }
    : null;
};

const collectRouteCoordinatesFromLegs = (
  legs: RouteLeg[],
  strategy: RouteStrategy
): { coords: [number, number][]; duration: number; distance: number } => {
  let duration = 0;
  let distance = 0;
  const coords: [number, number][] = [];
  for (const leg of legs) {
    const option = selectOptionForLegByStrategy(leg.options, strategy);
    if (!option) continue;
    duration += option.durationMinutes;
    distance += option.distanceKm;
    if (coords.length === 0) {
      coords.push(...option.geometry);
    } else if (option.geometry.length > 1) {
      coords.push(...option.geometry.slice(1));
    }
  }
  return { coords, duration, distance };
};

export const buildTripMapModel = (
  tripPlan: TripPlan | null,
  currentDayId: string | null,
  navigationPlan: NavigationPlan | null,
  dayDecisionHints: DayDecisionHints | null,
  selectedStrategy: RouteStrategy,
  viewLevel: ViewLevel,
  selectedPlaceId: string | null
): TripMapViewModel => {
  const points = selectMapPoints(tripPlan, currentDayId, viewLevel);
  const routeCoordinates: [number, number][] = [];
  let durationMinutes = 0;
  let distanceKm = 0;

  if (navigationPlan && viewLevel !== "overview") {
    const legsForCurrent =
      viewLevel === "place" && selectedPlaceId
        ? navigationPlan.legs.filter(
            (leg) => leg.fromPlaceId === selectedPlaceId || leg.toPlaceId === selectedPlaceId
          )
        : navigationPlan.legs;
    const summary = collectRouteCoordinatesFromLegs(legsForCurrent, selectedStrategy);
    routeCoordinates.push(...summary.coords);
    durationMinutes = summary.duration;
    distanceKm = summary.distance;
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

  const legs = navigationPlan?.legs ?? [];
  const walkOnlyDay =
    legs.length > 0 &&
    legs.every((leg) => leg.options.every((option) => option.mode === "walk"));

  return {
    title: tripPlan ? "Map Navigation" : "Map",
    subtitle: tripPlan ? `${tripPlan.days.length} 天行程 · 地点导航` : "加载地图中",
    points,
    routeCoordinates,
    selectedStrategy,
    viewLevel,
    selectedPlaceId,
    walkOnlyDay,
    routeSummary,
    decisionHintSummary: summarizeDecisionHint(dayDecisionHints),
    activeDayId: selectActiveDayId(tripPlan, currentDayId)
  };
};

export const buildTripOverviewModel = (
  tripPlan: TripPlan | null
): TripOverviewViewModel | null => {
  if (!tripPlan) return null;
  return {
    title: tripPlan.title,
    dateSpanLabel: `${tripPlan.startDate} - ${tripPlan.endDate}`,
    dayCount: tripPlan.days.length,
    placeCount: Object.keys(tripPlan.places).length,
    hint: "选择下方某一天查看当日详情"
  };
};

const buildPlaceLegViewModel = (
  leg: RouteLeg,
  direction: "incoming" | "outgoing",
  strategy: RouteStrategy,
  tripPlan: TripPlan | null
): PlaceLegViewModel => {
  const option = selectOptionForLegByStrategy(leg.options, strategy) ?? leg.options[0] ?? null;
  return {
    legId: leg.legId,
    fromPlaceId: leg.fromPlaceId,
    toPlaceId: leg.toPlaceId,
    fromName: lookupPlaceName(tripPlan, leg.fromPlaceId),
    toName: lookupPlaceName(tripPlan, leg.toPlaceId),
    durationMinutes: option?.durationMinutes ?? 0,
    distanceKm: option?.distanceKm ?? 0,
    mode: option?.mode ?? null,
    direction
  };
};

export const buildPlaceFocusCardModel = (
  tripPlan: TripPlan | null,
  currentDayId: string | null,
  selectedPlaceId: string | null,
  navigationPlan: NavigationPlan | null,
  dayDecisionHints: DayDecisionHints | null,
  strategy: RouteStrategy
): PlaceFocusCardViewModel | null => {
  if (!tripPlan || !selectedPlaceId) return null;
  const day = tripPlan.days.find((d) => d.dayId === currentDayId) ?? null;
  if (!day) return null;
  const place = tripPlan.places[selectedPlaceId] ?? null;
  if (!place) return null;

  const legs = navigationPlan?.legs ?? [];
  const predecessor = legs.find((leg) => leg.toPlaceId === selectedPlaceId) ?? null;
  const successor = legs.find((leg) => leg.fromPlaceId === selectedPlaceId) ?? null;
  const activity = day.items.find((item) => item.placeId === selectedPlaceId) ?? null;
  const eventEstimate =
    dayDecisionHints?.eventEstimates.find((e) => e.activityId === activity?.itemId) ?? null;
  const isFirstInDay = !predecessor;
  const isLastInDay = !successor;

  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address ?? "",
    highlight: place.highlights?.[0] ?? null,
    tip: place.tips?.[0] ?? null,
    incomingLeg: predecessor ? buildPlaceLegViewModel(predecessor, "incoming", strategy, tripPlan) : null,
    outgoingLeg: successor ? buildPlaceLegViewModel(successor, "outgoing", strategy, tripPlan) : null,
    isFirstInDay,
    isLastInDay,
    eventEstimate: eventEstimate
      ? {
          recommendedDepartureTime: eventEstimate.recommendedDepartureTime ?? null,
          latenessRiskLevel: eventEstimate.latenessRiskLevel,
          bufferMinutes: eventEstimate.suggestedBufferMinutes,
          travelMinutes: eventEstimate.travelMinutes
        }
      : null,
    closeHint: "按 Esc 或关闭按钮返回当日行程"
  };
};

const buildLegSummary = (
  leg: RouteLeg,
  strategy: RouteStrategy,
  tripPlan: TripPlan | null
): TripCurrentCardViewModel["legSummaries"][number] => {
  const option = selectOptionForLegByStrategy(leg.options, strategy) ?? leg.options[0] ?? null;
  return {
    legId: leg.legId,
    fromPlaceId: leg.fromPlaceId,
    toPlaceId: leg.toPlaceId,
    fromName: lookupPlaceName(tripPlan, leg.fromPlaceId),
    toName: lookupPlaceName(tripPlan, leg.toPlaceId),
    durationMinutes: option?.durationMinutes ?? 0,
    distanceKm: option?.distanceKm ?? 0,
    mode: option?.mode ?? null
  };
};

export const buildTripCurrentCardModel = (
  tripPlan: TripPlan | null,
  currentDay: TripDay | null,
  tipsModel: TripTipsViewModel,
  dayDecisionHints: DayDecisionHints | null,
  navigationPlan: NavigationPlan | null,
  strategy: RouteStrategy
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

  const legSummaries = (navigationPlan?.legs ?? []).map((leg) =>
    buildLegSummary(leg, strategy, tripPlan)
  );

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
    items,
    legSummaries
  };
};