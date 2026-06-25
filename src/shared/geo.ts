const toRadians = (value: number): number => (value * Math.PI) / 180;

export const haversineDistanceKm = (
  from: { lat?: number; lng?: number },
  to: { lat?: number; lng?: number }
): number | undefined => {
  if (
    typeof from.lat !== "number" ||
    typeof from.lng !== "number" ||
    typeof to.lat !== "number" ||
    typeof to.lng !== "number"
  ) {
    return undefined;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const sinHalfLat = Math.sin(deltaLat / 2);
  const sinHalfLng = Math.sin(deltaLng / 2);
  const a =
    sinHalfLat * sinHalfLat +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * sinHalfLng * sinHalfLng;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};