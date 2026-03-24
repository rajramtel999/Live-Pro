import type { RouteDoc, StopDoc, TransportType } from '@/types/transit';
import type { VehicleAvailabilityResult } from '@/lib/vehicleAvailabilityCalculator';

export interface RouteSearchStopSequenceItem {
  stopId: string;
  stopName: string;
  order: number;
  latitude: number;
  longitude: number;
  avgTimeToNextStop: number;
}

export interface RouteSearchResult {
  routeId: string;
  routeName: string;
  transportType: TransportType;
  route: RouteDoc;
  boardingStop: StopDoc;
  destinationStop: StopDoc;
  stopSequence: RouteSearchStopSequenceItem[];
  estimatedFare: number;
  estimatedTripEtaMinutes: number;
  estimatedWaitEtaMinutes: number;
  estimatedTotalEtaMinutes: number;
  availability: VehicleAvailabilityResult;
  rankingScore: number;
}

export interface RouteSearchResponse {
  fromInput: string;
  toInput: string;
  results: RouteSearchResult[];
}
