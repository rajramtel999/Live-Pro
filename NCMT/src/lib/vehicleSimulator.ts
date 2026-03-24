import { database } from '@/config/firebase';
import { ref, set, onValue, off } from 'firebase/database';
import type { RouteStopDoc } from '@/types/transit';

export interface VehiclePosition {
  vehicleId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  currentStopOrder: number;
  nextStopOrder: number;
  heading: number; // degrees
  speed: number; // km/h
  lastUpdated: number;
}

/**
 * Simulates a vehicle moving along route stops
 * Updates position in Firebase Realtime Database every few seconds
 */
export class VehicleSimulator {
  private vehicleId: string;
  private routeId: string;
  private routeStops: RouteStopDoc[];
  private currentPosition: VehiclePosition;
  private intervalId: NodeJS.Timeout | null = null;
  private stopIndex: number = 0;
  private progressToNextStop: number = 0;

  constructor(vehicleId: string, routeId: string, routeStops: RouteStopDoc[]) {
    this.vehicleId = vehicleId;
    this.routeId = routeId;
    this.routeStops = routeStops.sort((a, b) => a.order - b.order);

    const firstStop = this.routeStops[0];
    this.currentPosition = {
      vehicleId,
      routeId,
      latitude: firstStop.latitude,
      longitude: firstStop.longitude,
      currentStopOrder: firstStop.order,
      nextStopOrder: this.routeStops[1]?.order || firstStop.order,
      heading: 0,
      speed: 30, // km/h average
      lastUpdated: Date.now(),
    };
  }

  /**
   * Start simulating vehicle movement
   */
  start(updateIntervalMs: number = 2000) {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      this.updatePosition();
    }, updateIntervalMs);

    // Initial position update
    this.updatePosition();
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Update vehicle position and push to Firebase
   */
  private updatePosition() {
    // Move progress along route (5% per update = ~40 seconds per segment at 2s intervals)
    this.progressToNextStop += 0.05;

    // If reached next stop, move to next segment
    if (this.progressToNextStop >= 1) {
      this.progressToNextStop = 0;
      this.stopIndex = (this.stopIndex + 1) % this.routeStops.length;
    }

    const currentStop = this.routeStops[this.stopIndex];
    const nextStopIndex = (this.stopIndex + 1) % this.routeStops.length;
    const nextStop = this.routeStops[nextStopIndex];

    // Interpolate position between current and next stop
    const lat = this.lerp(
      currentStop.latitude,
      nextStop.latitude,
      this.progressToNextStop
    );
    const lng = this.lerp(
      currentStop.longitude,
      nextStop.longitude,
      this.progressToNextStop
    );

    // Calculate heading (bearing)
    const heading = this.calculateBearing(
      currentStop.latitude,
      currentStop.longitude,
      nextStop.latitude,
      nextStop.longitude
    );

    this.currentPosition = {
      vehicleId: this.vehicleId,
      routeId: this.routeId,
      latitude: lat,
      longitude: lng,
      currentStopOrder: currentStop.order,
      nextStopOrder: nextStop.order,
      heading,
      speed: 30 + Math.random() * 10, // 30-40 km/h
      lastUpdated: Date.now(),
    };

    // Push to Firebase Realtime Database
    this.pushToFirebase();
  }

  /**
   * Linear interpolation
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Calculate bearing between two coordinates
   */
  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
  }

  /**
   * Push current position to Firebase Realtime Database
   */
  private async pushToFirebase() {
    try {
      const positionRef = ref(database, `vehiclePositions/${this.vehicleId}`);
      await set(positionRef, this.currentPosition);
    } catch (error) {
      console.error('Failed to update vehicle position:', error);
    }
  }

  /**
   * Get current position
   */
  getPosition(): VehiclePosition {
    return this.currentPosition;
  }
}

/**
 * Subscribe to vehicle position updates from Firebase
 */
export function subscribeToVehiclePositions(
  routeId: string,
  callback: (positions: Record<string, VehiclePosition>) => void
) {
  const positionsRef = ref(database, 'vehiclePositions');

  onValue(positionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Filter by routeId
      const filtered: Record<string, VehiclePosition> = {};
      Object.entries(data).forEach(([vehicleId, position]) => {
        if ((position as VehiclePosition).routeId === routeId) {
          filtered[vehicleId] = position as VehiclePosition;
        }
      });
      callback(filtered);
    } else {
      callback({});
    }
  });

  return () => {
    off(positionsRef);
  };
}

/**
 * Subscribe to a single vehicle position
 */
export function subscribeToVehiclePosition(
  vehicleId: string,
  callback: (position: VehiclePosition | null) => void
) {
  const positionRef = ref(database, `vehiclePositions/${vehicleId}`);

  onValue(positionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data as VehiclePosition | null);
  });

  return () => {
    off(positionRef);
  };
}
