import type { Place, TripDay, TripPlan } from "../../../../domains/trip-planning/trip-plan";

export type MapPointSelectorResult = {
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

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const toPseudoCoordinate = (seed: string): { x: number; y: number } => {
  const hashX = stableHash(`${seed}:x`);
  const hashY = stableHash(`${seed}:y`);
  return {
    x: 14 + (hashX % 72),
    y: 18 + (hashY % 62)
  };
};

const toMapCoordinate = (place: Place, seed: string): { x: number; y: number } => {
  if (typeof place.lng === "number" && typeof place.lat === "number") {
    return {
      x: clamp(((place.lng + 180) / 360) * 100, 8, 92),
      y: clamp((1 - (place.lat + 90) / 180) * 100, 12, 88)
    };
  }

  return toPseudoCoordinate(seed);
};

export const selectActiveDayId = (
  tripPlan: TripPlan | null,
  currentDayId: string | null
): string | null => {
  if (!tripPlan) {
    return null;
  }

  if (!currentDayId) {
    return tripPlan.days[0]?.dayId ?? null;
  }

  return tripPlan.days.some((day) => day.dayId === currentDayId)
    ? currentDayId
    : tripPlan.days[0]?.dayId ?? null;
};

export const selectCurrentDay = (
  tripPlan: TripPlan | null,
  currentDayId: string | null
): TripDay | null => {
  const activeDayId = selectActiveDayId(tripPlan, currentDayId);
  if (!tripPlan || !activeDayId) {
    return null;
  }

  return tripPlan.days.find((day) => day.dayId === activeDayId) ?? null;
};

export const selectMapPoints = (
  tripPlan: TripPlan | null,
  currentDayId: string | null
): MapPointSelectorResult[] => {
  if (!tripPlan) {
    return [];
  }

  const activeDayId = selectActiveDayId(tripPlan, currentDayId);
  const points: MapPointSelectorResult[] = [];

  for (const day of tripPlan.days) {
    const usedPlaceIds = new Set<string>();
    for (const item of day.items) {
      if (!item.placeId || usedPlaceIds.has(item.placeId)) {
        continue;
      }

      const place = tripPlan.places[item.placeId];
      if (!place) {
        continue;
      }

      usedPlaceIds.add(item.placeId);

      const coordinates = toMapCoordinate(place, `${day.dayId}:${item.placeId}`);
      points.push({
        pointId: `${day.dayId}:${item.placeId}`,
        dayId: day.dayId,
        label: place.name,
        address: place.address ?? "",
        lat: typeof place.lat === "number" ? place.lat : null,
        lng: typeof place.lng === "number" ? place.lng : null,
        x: coordinates.x,
        y: coordinates.y,
        isActive: day.dayId === activeDayId
      });
    }
  }

  return points;
};
