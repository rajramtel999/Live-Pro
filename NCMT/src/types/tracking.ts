// ──────────────────────────────────────────────────────────────
// Live Tracking Types
// ──────────────────────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

/** Raw GPS reading from browser Geolocation API */
export interface GPSReading {
  latitude: number;
  longitude: number;
  accuracy: number;   // metres
  speed: number | null; // m/s — null when unavailable
  heading: number | null; // degrees — null when unavailable
  timestamp: number;
}

/** Driver session stored in Firebase Realtime Database */
export interface DriverSession {
  driverId: string;
  vehicleId: string;
  routeId: string;
  vehicleLabel: string;
  isActive: boolean;
  startedAt: number;
  lastSeen: number;
}

/** Computed ETA from vehicle to a stop */
export interface ETAResult {
  distanceMetres: number;
  etaMinutes: number;
  /** ISO string */
  arrivalTime: string;
}

/** State returned by useDriverTracking hook */
export interface DriverTrackingState {
  isTracking: boolean;
  lastPosition: GPSReading | null;
  error: string | null;
  startTracking: (vehicleId: string, routeId: string, label: string) => void;
  stopTracking: () => void;
}

/** State returned by useVehicleTracking hook */
export interface VehicleTrackingState {
  vehicles: Record<string, import('@/lib/vehicleTracking').VehiclePosition>;
  vehicleCount: number;
  isConnected: boolean;
}
