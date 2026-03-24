import type { RouteStopDoc, VehicleDoc } from '@/types/transit';
import { findStopOrder, validateRouteStopOrder } from '@/lib/routeOrderValidator';

export interface EtaEstimateResult {
  etaMinutes: number;
  segmentsAway: number;
}

function sortByOrder(routeStops: RouteStopDoc[]): RouteStopDoc[] {
  return [...routeStops].sort((a, b) => a.order - b.order);
}

function sumAverageMinutesBetweenOrders(
  routeStops: RouteStopDoc[],
  fromOrder: number,
  toOrder: number
): number {
  const ordered = sortByOrder(routeStops).filter(
    (stop) => stop.order >= fromOrder && stop.order < toOrder
  );

  return ordered.reduce((sum, stop) => sum + stop.avgTimeToNextStop, 0);
}

export function estimateEtaToBoardingStop(
  vehicle: VehicleDoc,
  boardingStopId: string,
  routeStops: RouteStopDoc[]
): EtaEstimateResult | null {
  const boardingOrder = findStopOrder(routeStops, boardingStopId);

  if (boardingOrder === null) {
    return null;
  }

  const currentOrder = vehicle.currentStopOrder;

  if (currentOrder >= boardingOrder) {
    return {
      etaMinutes: 1,
      segmentsAway: 0,
    };
  }

  const etaMinutes = sumAverageMinutesBetweenOrders(
    routeStops,
    currentOrder,
    boardingOrder
  );

  return {
    etaMinutes,
    segmentsAway: boardingOrder - currentOrder,
  };
}

export function estimateTripEtaBetweenStops(
  boardingStopId: string,
  destinationStopId: string,
  routeStops: RouteStopDoc[]
): number {
  const validation = validateRouteStopOrder(routeStops, boardingStopId, destinationStopId);

  if (!validation.isValid || validation.fromOrder === null || validation.toOrder === null) {
    return 0;
  }

  return sumAverageMinutesBetweenOrders(
    routeStops,
    validation.fromOrder,
    validation.toOrder
  );
}

export function estimateTotalEta(
  vehicle: VehicleDoc,
  boardingStopId: string,
  destinationStopId: string,
  routeStops: RouteStopDoc[]
): number {
  const waitEta = estimateEtaToBoardingStop(vehicle, boardingStopId, routeStops);
  const tripEta = estimateTripEtaBetweenStops(boardingStopId, destinationStopId, routeStops);

  return (waitEta?.etaMinutes ?? 0) + tripEta;
}
