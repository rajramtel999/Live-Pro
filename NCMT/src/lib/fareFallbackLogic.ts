import type { FareDoc, RouteStopDoc } from '@/types/transit';
import { findFareByStops, findNearestFareBrackets } from '@/lib/fareLookupUtility';
import { getSegmentCountBetweenStops } from '@/lib/routeOrderValidator';

export interface FareEstimationResult {
  fareAmount: number;
  source: 'exact' | 'segment-fallback' | 'flat-fallback';
}

export interface FareEstimationInput {
  routeId: string;
  fromStopId: string;
  toStopId: string;
  fares: FareDoc[];
  routeStops: RouteStopDoc[];
  segmentBaseFare?: number;
}

export function estimateFareWithFallback({
  routeId,
  fromStopId,
  toStopId,
  fares,
  routeStops,
  segmentBaseFare = 8,
}: FareEstimationInput): FareEstimationResult {
  const directFare = findFareByStops(fares, routeId, fromStopId, toStopId);

  if (directFare) {
    return {
      fareAmount: directFare.fareAmount,
      source: 'exact',
    };
  }

  const segmentCount = getSegmentCountBetweenStops(routeStops, fromStopId, toStopId);

  if (segmentCount > 0) {
    const fallbackAmount = Math.max(15, Math.round(segmentCount * segmentBaseFare));

    return {
      fareAmount: fallbackAmount,
      source: 'segment-fallback',
    };
  }

  const bracket = findNearestFareBrackets(fares, routeId);
  const flatFallback = bracket ? Math.round((bracket.minFare + bracket.maxFare) / 2) : 20;

  return {
    fareAmount: flatFallback,
    source: 'flat-fallback',
  };
}
