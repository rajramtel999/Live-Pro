'use client';

import { useEffect, useState } from 'react';
import {
  subscribeToRouteVehicles,
  type VehiclePosition,
} from '@/lib/vehicleTracking';

export interface UseVehicleTrackingResult {
  vehicles: Record<string, VehiclePosition>;
  vehicleCount: number;
  isConnected: boolean;
}

export function useVehicleTracking(routeId: string): UseVehicleTrackingResult {
  const [vehicles, setVehicles] = useState<Record<string, VehiclePosition>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!routeId) return;

    setIsConnected(false);

    const unsubscribe = subscribeToRouteVehicles(routeId, (updatedVehicles) => {
      setVehicles(updatedVehicles);
      setIsConnected(true);
    });

    return () => {
      unsubscribe();
      setVehicles({});
      setIsConnected(false);
    };
  }, [routeId]);

  return {
    vehicles,
    vehicleCount: Object.keys(vehicles).length,
    isConnected,
  };
}
