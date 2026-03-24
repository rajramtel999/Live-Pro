import type { FareDoc } from '@/types/transit';

export function findFareByStops(
  fares: FareDoc[],
  routeId: string,
  fromStopId: string,
  toStopId: string
): FareDoc | null {
  const directFare = fares.find(
    (fare) =>
      fare.routeId === routeId &&
      fare.fromStopId === fromStopId &&
      fare.toStopId === toStopId
  );

  return directFare ?? null;
}

export function findNearestFareBrackets(
  fares: FareDoc[],
  routeId: string
): { minFare: number; maxFare: number } | null {
  const routeFares = fares.filter((fare) => fare.routeId === routeId);

  if (!routeFares.length) {
    return null;
  }

  const sorted = routeFares.map((fare) => fare.fareAmount).sort((a, b) => a - b);

  return {
    minFare: sorted[0],
    maxFare: sorted[sorted.length - 1],
  };
}
