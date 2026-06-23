const EARTH_RADIUS_METERS = 6_371_000;

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceMeters(from: GeoPoint, to: GeoPoint) {
  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function isWithinGeofence(
  user: GeoPoint,
  target: GeoPoint,
  radiusMeters: number,
) {
  return getDistanceMeters(user, target) <= radiusMeters;
}

export function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
