const EARTH_RADIUS_KM = 6371;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine distance in kilometres between two WGS84 coordinates.
 * Distance = 2r arcsin(√(sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlon/2)))
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function isWithinRadius(
  origin: { latitude: number; longitude: number },
  point: { latitude: number; longitude: number },
  radiusKm = 20,
): boolean {
  return (
    haversineDistanceKm(origin.latitude, origin.longitude, point.latitude, point.longitude) <=
    radiusKm
  );
}

export function withDistance<T extends { latitude: number; longitude: number }>(
  origin: { latitude: number; longitude: number },
  item: T,
): T & { distanceKm: number } {
  return {
    ...item,
    distanceKm: haversineDistanceKm(
      origin.latitude,
      origin.longitude,
      item.latitude,
      item.longitude,
    ),
  };
}

export function filterWithinRadius<T extends { latitude: number; longitude: number }>(
  origin: { latitude: number; longitude: number },
  items: T[],
  radiusKm = 20,
): (T & { distanceKm: number })[] {
  return items
    .map((item) => withDistance(origin, item))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}
