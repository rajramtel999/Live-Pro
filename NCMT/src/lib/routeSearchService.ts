import { sampleTransitData } from '@/data/sampleTransitData';
import { estimateFareWithFallback } from '@/lib/fareFallbackLogic';
import {
  estimateEtaToBoardingStop,
  estimateTotalEta,
  estimateTripEtaBetweenStops,
} from '@/lib/etaSegmentCalculator';
import { matchNearestStopByName } from '@/lib/nearestStopMatcher';
import { rankCandidateRoutes } from '@/lib/routeRankingStrategy';
import { validateRouteStopOrder } from '@/lib/routeOrderValidator';
import { getVehicleAvailabilityByCount } from '@/lib/vehicleAvailabilityCalculator';
import type { RouteSearchResponse, RouteSearchResult } from '@/types/searchResult';

interface SearchOptions {
  limit?: number;
  mode?: 'any' | 'micro' | 'microbus' | 'tempo';
}

function normalizeMode(mode: string | undefined): 'any' | 'micro' | 'tempo' {
  if (!mode) {
    return 'any';
  }

  const value = mode.trim().toLowerCase();

  if (value === 'microbus' || value === 'micro-bus' || value === 'micro') {
    return 'micro';
  }

  if (value === 'tempo') {
    return 'tempo';
  }

  return 'any';
}

export async function searchRoutes(
  fromInput: string,
  toInput: string,
  options: SearchOptions = {}
): Promise<RouteSearchResponse> {
  const fromMatch = matchNearestStopByName(fromInput, sampleTransitData.stops);
  const toMatch = matchNearestStopByName(toInput, sampleTransitData.stops);

  if (!fromMatch || !toMatch) {
    return {
      fromInput,
      toInput,
      results: [],
    };
  }

  const normalizedMode = normalizeMode(options.mode);

  const candidateInputs = sampleTransitData.routes
    .filter((route) => {
      if (!route.isApproved) {
        return false;
      }

      if (normalizedMode !== 'any') {
        return route.type === normalizedMode;
      }

      return true;
    })
    .map((route) => {
      const routeStops = sampleTransitData.routeStops.filter(
        (routeStop) => routeStop.routeId === route.id
      );

      const orderValidation = validateRouteStopOrder(
        routeStops,
        fromMatch.stop.id,
        toMatch.stop.id
      );

      if (!orderValidation.isValid) {
        return null;
      }

      const vehicles = sampleTransitData.vehicles.filter(
        (vehicle) => vehicle.routeId === route.id && vehicle.status === 'active'
      );

      const fallbackFare = estimateFareWithFallback({
        routeId: route.id,
        fromStopId: fromMatch.stop.id,
        toStopId: toMatch.stop.id,
        fares: sampleTransitData.fares,
        routeStops,
      });

      const leadVehicle = vehicles[0];
      const tripEta = estimateTripEtaBetweenStops(
        fromMatch.stop.id,
        toMatch.stop.id,
        routeStops
      );

      const waitEta = leadVehicle
        ? (estimateEtaToBoardingStop(leadVehicle, fromMatch.stop.id, routeStops)?.etaMinutes ?? 0)
        : 0;

      const totalEta = leadVehicle
        ? estimateTotalEta(leadVehicle, fromMatch.stop.id, toMatch.stop.id, routeStops)
        : tripEta;

      return {
        route,
        routeStops,
        boardingStopId: fromMatch.stop.id,
        destinationStopId: toMatch.stop.id,
        nearestBoardingScore: fromMatch.score,
        nearestDestinationScore: toMatch.score,
        activeVehicleCount: vehicles.length,
        estimatedFare: fallbackFare.fareAmount,
        estimatedEtaMinutes: totalEta,
        _view: {
          fare: fallbackFare.fareAmount,
          waitEta,
          tripEta,
          totalEta,
          vehicles,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const ranked = rankCandidateRoutes(candidateInputs);

  const limited = options.limit ? ranked.slice(0, options.limit) : ranked;

  const results: RouteSearchResult[] = limited
    .map((rankedRoute) => {
      const candidate = candidateInputs.find(
        (entry) => entry.route.id === rankedRoute.route.id
      );

      if (!candidate) {
        return null;
      }

      const segment = validateRouteStopOrder(
        candidate.routeStops,
        candidate.boardingStopId,
        candidate.destinationStopId
      );

      if (!segment.isValid) {
        return null;
      }

      const stopSequence = segment.segmentStops
        .map((routeStop) => {
          const stopMeta = sampleTransitData.stops.find((stop) => stop.id === routeStop.stopId);

          if (!stopMeta) {
            return null;
          }

          return {
            stopId: stopMeta.id,
            stopName: stopMeta.name,
            order: routeStop.order,
            latitude: stopMeta.latitude,
            longitude: stopMeta.longitude,
            avgTimeToNextStop: routeStop.avgTimeToNextStop,
          };
        })
        .filter((stop): stop is NonNullable<typeof stop> => stop !== null);

      const availability = getVehicleAvailabilityByCount(candidate._view.vehicles.length);
      const boardingStop = sampleTransitData.stops.find(
        (stop) => stop.id === candidate.boardingStopId
      );
      const destinationStop = sampleTransitData.stops.find(
        (stop) => stop.id === candidate.destinationStopId
      );

      if (!boardingStop || !destinationStop) {
        return null;
      }

      return {
        routeId: candidate.route.id,
        routeName: candidate.route.name,
        transportType: candidate.route.type,
        route: candidate.route,
        boardingStop,
        destinationStop,
        stopSequence,
        estimatedFare: candidate._view.fare,
        estimatedTripEtaMinutes: candidate._view.tripEta,
        estimatedWaitEtaMinutes: candidate._view.waitEta,
        estimatedTotalEtaMinutes: candidate._view.totalEta,
        availability,
        rankingScore: rankedRoute.score,
      };
    })
    .filter((result): result is RouteSearchResult => result !== null);

  return {
    fromInput,
    toInput,
    results,
  };
}
