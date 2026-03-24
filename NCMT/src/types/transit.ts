export type TransportType = 'micro' | 'tempo';
export type SubmissionType = 'route' | 'fare' | 'stop';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type VehicleStatus = 'active' | 'inactive';

export const TRANSIT_COLLECTIONS = {
  routes: 'routes',
  stops: 'stops',
  routeStops: 'routeStops',
  fares: 'fares',
  vehicles: 'vehicles',
  submissions: 'submissions',
} as const;

export type TransitCollectionName =
  (typeof TRANSIT_COLLECTIONS)[keyof typeof TRANSIT_COLLECTIONS];

export interface RouteDoc {
  id: string;
  name: string;
  type: TransportType;
  startPoint: string;
  endPoint: string;
  isApproved: boolean;
  createdBy: string;
}

export interface StopDoc {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteStopDoc {
  id: string;
  routeId: string;
  stopId: string;
  order: number;
  avgTimeToNextStop: number;
}

export interface FareDoc {
  id: string;
  routeId: string;
  fromStopId: string;
  toStopId: string;
  fareAmount: number;
}

export interface VehicleDoc {
  id: string;
  routeId: string;
  label: string;
  status: VehicleStatus;
  currentStopOrder: number;
  nextStopOrder: number;
  updatedAt: string;
}

export interface SubmissionDoc {
  id: string;
  submittedBy: string;
  type: SubmissionType;
  payload: Record<string, unknown>;
  status: SubmissionStatus;
}

export interface TransitSeedData {
  routes: RouteDoc[];
  stops: StopDoc[];
  routeStops: RouteStopDoc[];
  fares: FareDoc[];
  vehicles: VehicleDoc[];
  submissions: SubmissionDoc[];
}

export interface TransitCollectionDocMap {
  routes: RouteDoc;
  stops: StopDoc;
  routeStops: RouteStopDoc;
  fares: FareDoc;
  vehicles: VehicleDoc;
  submissions: SubmissionDoc;
}

export interface TransitCollectionListMap {
  routes: RouteDoc[];
  stops: StopDoc[];
  routeStops: RouteStopDoc[];
  fares: FareDoc[];
  vehicles: VehicleDoc[];
  submissions: SubmissionDoc[];
}

export function isTransportType(value: string): value is TransportType {
  return value === 'micro' || value === 'tempo';
}

export function isSubmissionType(value: string): value is SubmissionType {
  return value === 'route' || value === 'fare' || value === 'stop';
}

export function isSubmissionStatus(value: string): value is SubmissionStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected';
}

export function isVehicleStatus(value: string): value is VehicleStatus {
  return value === 'active' || value === 'inactive';
}
