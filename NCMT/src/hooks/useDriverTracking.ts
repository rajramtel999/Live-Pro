'use client';

import { useCallback, useRef, useState } from 'react';
import {
  updateVehiclePosition,
  calculateBearing,
  type VehiclePosition,
} from '@/lib/vehicleTracking';
import type { GPSReading, DriverTrackingState } from '@/types/tracking';

const MS_TO_KMH = 3.6;

export function useDriverTracking(): DriverTrackingState {
  const [isTracking, setIsTracking] = useState(false);
  const [lastPosition, setLastPosition] = useState<GPSReading | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const prevPosRef = useRef<GeolocationPosition | null>(null);
  const vehicleIdRef = useRef('');
  const routeIdRef = useRef('');
  const stopIndexRef = useRef(0);

  const handlePosition = useCallback(
    async (geoPos: GeolocationPosition) => {
      const { latitude, longitude, speed, heading, accuracy } = geoPos.coords;
      const timestamp = geoPos.timestamp;

      // Compute heading from previous position if native heading is null
      let computedHeading = heading ?? 0;
      if (prevPosRef.current && heading === null) {
        computedHeading = calculateBearing(
          prevPosRef.current.coords.latitude,
          prevPosRef.current.coords.longitude,
          latitude,
          longitude
        );
      }

      const speedKmh = speed != null ? speed * MS_TO_KMH : 0;

      const reading: GPSReading = {
        latitude,
        longitude,
        accuracy,
        speed: speedKmh,
        heading: computedHeading,
        timestamp,
      };
      setLastPosition(reading);
      prevPosRef.current = geoPos;

      const position: VehiclePosition = {
        vehicleId: vehicleIdRef.current,
        routeId: routeIdRef.current,
        latitude,
        longitude,
        currentStopIndex: stopIndexRef.current,
        nextStopIndex: stopIndexRef.current + 1,
        heading: computedHeading,
        speed: speedKmh,
        timestamp,
        status: speedKmh > 1 ? 'moving' : 'stopped',
      };

      try {
        await updateVehiclePosition(vehicleIdRef.current, position);
      } catch (err) {
        console.error('Failed to update vehicle position:', err);
      }
    },
    []
  );

  const handleError = useCallback((err: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: 'Location permission denied. Please allow location access.',
      2: 'Location unavailable. Check your device GPS.',
      3: 'Location request timed out. Try again.',
    };
    setError(messages[err.code] ?? 'Unknown location error.');
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(
    (vehicleId: string, routeId: string, label: string) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }

      vehicleIdRef.current = vehicleId || `vehicle-${label.toLowerCase().replace(/\s+/g, '-')}`;
      routeIdRef.current = routeId;
      setError(null);
      setIsTracking(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 2_000,
        }
      );
    },
    [handlePosition, handleError]
  );

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Explicitly update Firebase to mark vehicle as stopped when driver ends session
    if (vehicleIdRef.current && prevPosRef.current) {
      try {
        const { latitude, longitude } = prevPosRef.current.coords;
        const position: VehiclePosition = {
          vehicleId: vehicleIdRef.current,
          routeId: routeIdRef.current,
          latitude,
          longitude,
          currentStopIndex: stopIndexRef.current,
          nextStopIndex: stopIndexRef.current + 1,
          heading: 0,
          speed: 0,
          timestamp: Date.now(),
          status: 'stopped', // Important: tell riders we stopped broadcasting
        };
        await updateVehiclePosition(vehicleIdRef.current, position);
      } catch (err) {
        console.error('Failed to update stop status:', err);
      }
    }

    prevPosRef.current = null;
    setIsTracking(false);
    setLastPosition(null);
  }, []);

  return { isTracking, lastPosition, error, startTracking, stopTracking };
}
