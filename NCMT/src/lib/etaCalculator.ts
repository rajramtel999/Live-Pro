import type { ETAResult } from '@/types/tracking';

const EARTH_RADIUS_M = 6_371_000;

/**
 * Haversine formula — returns distance in metres between two lat/lng points.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/**
 * Estimate arrival time from a vehicle to a stop.
 * @param vehicleLat  current vehicle latitude
 * @param vehicleLon  current vehicle longitude
 * @param stopLat     destination stop latitude
 * @param stopLon     destination stop longitude
 * @param speedKmh    current vehicle speed (km/h). Falls back to 20 km/h if 0.
 */
export function estimateETA(
  vehicleLat: number,
  vehicleLon: number,
  stopLat: number,
  stopLon: number,
  speedKmh: number
): ETAResult {
  const distanceMetres = haversineDistance(vehicleLat, vehicleLon, stopLat, stopLon);
  const effectiveSpeed = Math.max(speedKmh, 5); // floor at 5 km/h to avoid ∞
  const etaMinutes = distanceMetres / 1000 / effectiveSpeed * 60;

  const arrivalDate = new Date(Date.now() + etaMinutes * 60 * 1000);
  return {
    distanceMetres: Math.round(distanceMetres),
    etaMinutes: Math.round(etaMinutes),
    arrivalTime: arrivalDate.toISOString(),
  };
}

/** Format metres to a human‑readable string */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** Format minutes to "X min" or "Arriving" */
export function formatETA(minutes: number): string {
  if (minutes <= 1) return 'Arriving';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
