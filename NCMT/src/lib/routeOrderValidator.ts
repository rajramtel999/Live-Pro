import type { RouteStopDoc } from '@/types/transit';

export interface RouteSegmentValidationResult {
  isValid: boolean;
  fromOrder: number | null;
  toOrder: number | null;
  segmentStops: RouteStopDoc[];
}

function sortRouteStopsByOrder(routeStops: RouteStopDoc[]): RouteStopDoc[] {
  return [...routeStops].sort((a, b) => a.order - b.order);
}

export function findStopOrder(
  routeStops: RouteStopDoc[],
  stopId: string
): number | null {
  const matched = routeStops.find((stop) => stop.stopId === stopId);
  return matched ? matched.order : null;
}

export function validateRouteStopOrder(
  routeStops: RouteStopDoc[],
  fromStopId: string,
  toStopId: string
): RouteSegmentValidationResult {
  const orderedStops = sortRouteStopsByOrder(routeStops);
  const fromOrder = findStopOrder(orderedStops, fromStopId);
  const toOrder = findStopOrder(orderedStops, toStopId);

  if (fromOrder === null || toOrder === null || fromOrder >= toOrder) {
    return {
      isValid: false,
      fromOrder,
      toOrder,
      segmentStops: [],
    };
  }

  const segmentStops = orderedStops.filter(
    (stop) => stop.order >= fromOrder && stop.order <= toOrder
  );

  return {
    isValid: true,
    fromOrder,
    toOrder,
    segmentStops,
  };
}

export function getSegmentCountBetweenStops(
  routeStops: RouteStopDoc[],
  fromStopId: string,
  toStopId: string
): number {
  const validation = validateRouteStopOrder(routeStops, fromStopId, toStopId);

  if (!validation.isValid || validation.fromOrder === null || validation.toOrder === null) {
    return 0;
  }

  return validation.toOrder - validation.fromOrder;
}
