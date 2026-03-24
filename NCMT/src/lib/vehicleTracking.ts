import { db } from '@/config/firebase';
import { ref, set, onValue, off } from 'firebase/database';
import type { RouteStopDoc } from '@/types/transit';

export interface VehiclePosition {
  vehicleId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  currentStopIndex: number;
  nextStopIndex: number;
  heading: number; // direction in degrees
  speed: number; // km/h
  timestamp: number;
  status: 'moving' | 'stopped';
}

/**
 * Update vehicle position in Realtime Database
 */
export async function updateVehiclePosition(
  vehicleId: string,
  position: VehiclePosition
): Promise<void> {
  const vehicleRef = ref(db, `vehiclePositions/${vehicleId}`);
  await set(vehicleRef, position);
}

/**
 * Subscribe to real-time vehicle position updates
 */
export function subscribeToVehiclePosition(
  vehicleId: string,
  callback: (position: VehiclePosition | null) => void
): () => void {
  const vehicleRef = ref(db, `vehiclePositions/${vehicleId}`);

  onValue(vehicleRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  // Return unsubscribe function
  return () => off(vehicleRef);
}

/**
 * Subscribe to all vehicles on a route
 */
export function subscribeToRouteVehicles(
  routeId: string,
  callback: (vehicles: Record<string, VehiclePosition>) => void
): () => void {
  const routeRef = ref(db, 'vehiclePositions');

  onValue(routeRef, (snapshot) => {
    const allVehicles = snapshot.val() || {};
    const routeVehicles: Record<string, VehiclePosition> = {};

    Object.entries(allVehicles).forEach(([vehicleId, position]) => {
      if ((position as VehiclePosition).routeId === routeId) {
        routeVehicles[vehicleId] = position as VehiclePosition;
      }
    });

    callback(routeVehicles);
  });

  return () => off(routeRef);
}

/**
 * Calculate position between two points
 */
export function interpolatePosition(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  progress: number // 0 to 1
): { latitude: number; longitude: number } {
  return {
    latitude: lat1 + (lat2 - lat1) * progress,
    longitude: lon1 + (lon2 - lon1) * progress,
  };
}

/**
 * Calculate bearing/heading between two points
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.cos(dLon);
  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

/**
 * Simulate vehicle movement along a route
 */
export class VehicleSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private currentStopIndex: number = 0;
  private progress: number = 0;
  private speed: number = 30; // km/h

  constructor(
    private vehicleId: string,
    private routeId: string,
    private routeStops: RouteStopDoc[]
  ) {}

  start(): void {
    if (this.intervalId) return;

    // Update every 2 seconds
    this.intervalId = setInterval(() => {
      this.updatePosition();
    }, 2000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async updatePosition(): Promise<void> {
    if (this.routeStops.length < 2) return;

    const currentStop = this.routeStops[this.currentStopIndex];
    const nextStopIndex =
      (this.currentStopIndex + 1) % this.routeStops.length;
    const nextStop = this.routeStops[nextStopIndex];

    // Move vehicle along the route
    this.progress += 0.1; // Increase progress

    if (this.progress >= 1) {
      // Reached next stop
      this.progress = 0;
      this.currentStopIndex = nextStopIndex;
      return;
    }

    const position = interpolatePosition(
      currentStop.latitude,
      currentStop.longitude,
      nextStop.latitude,
      nextStop.longitude,
      this.progress
    );

    const heading = calculateBearing(
      currentStop.latitude,
      currentStop.longitude,
      nextStop.latitude,
      nextStop.longitude
    );

    const vehiclePosition: VehiclePosition = {
      vehicleId: this.vehicleId,
      routeId: this.routeId,
      latitude: position.latitude,
      longitude: position.longitude,
      currentStopIndex: this.currentStopIndex,
      nextStopIndex,
      heading,
      speed: this.speed,
      timestamp: Date.now(),
      status: 'moving',
    };

    await updateVehiclePosition(this.vehicleId, vehiclePosition);
  }
}
