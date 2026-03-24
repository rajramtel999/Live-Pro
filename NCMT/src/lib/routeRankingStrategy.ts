import type { RouteDoc, RouteStopDoc } from '@/types/transit';
import { getSegmentCountBetweenStops, validateRouteStopOrder } from '@/lib/routeOrderValidator';

export interface RankedRouteInput {
  route: RouteDoc;
  routeStops: RouteStopDoc[];
  boardingStopId: string;
  destinationStopId: string;
  nearestBoardingScore: number;
  nearestDestinationScore: number;
  activeVehicleCount: number;
  estimatedFare?: number;
  estimatedEtaMinutes?: number;
}

export interface RankedRouteResult {
  route: RouteDoc;
  score: number;
  segmentCount: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getVehicleScore(activeVehicleCount: number): number {
  if (activeVehicleCount >= 3) {
    return 1;
  }

  if (activeVehicleCount === 2) {
    return 0.75;
  }

  if (activeVehicleCount === 1) {
    return 0.45;
  }

  return 0;
}

function getEtaScore(estimatedEtaMinutes?: number): number {
  if (estimatedEtaMinutes === undefined) {
    return 0.5;
  }

  return clamp(1 - estimatedEtaMinutes / 60, 0, 1);
}

function getFareScore(estimatedFare?: number): number {
  if (estimatedFare === undefined) {
    return 0.5;
  }

  return clamp(1 - estimatedFare / 80, 0, 1);
}

export function rankCandidateRoutes(inputs: RankedRouteInput[]): RankedRouteResult[] {
  return inputs
    .map((input) => {
      const validation = validateRouteStopOrder(
        input.routeStops,
        input.boardingStopId,
        input.destinationStopId
      );

      if (!validation.isValid) {
        return null;
      }

      const segmentCount = getSegmentCountBetweenStops(
        input.routeStops,
        input.boardingStopId,
        input.destinationStopId
      );

      const proximityScore =
        (input.nearestBoardingScore + input.nearestDestinationScore) / 2;
      const vehicleScore = getVehicleScore(input.activeVehicleCount);
      const etaScore = getEtaScore(input.estimatedEtaMinutes);
      const fareScore = getFareScore(input.estimatedFare);

      const score =
        proximityScore * 0.38 +
        vehicleScore * 0.24 +
        etaScore * 0.22 +
        fareScore * 0.16;

      return {
        route: input.route,
        score: Number(score.toFixed(4)),
        segmentCount,
      };
    })
    .filter((result): result is RankedRouteResult => result !== null)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.segmentCount - b.segmentCount;
    });
}
