'use client';

import { useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import type { RouteSearchStopSequenceItem } from '@/types/searchResult';

interface MapViewProps {
  stops: RouteSearchStopSequenceItem[];
  activeVehicleCount: number;
}

export default function MapView({ stops, activeVehicleCount }: MapViewProps) {
  const positions = useMemo(
    () => stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]),
    [stops]
  );

  const vehicleMarkers = useMemo(() => {
    if (!stops.length || activeVehicleCount <= 0) {
      return [] as Array<{ id: string; latitude: number; longitude: number; stopName: string }>;
    }

    const markerCount = Math.min(activeVehicleCount, stops.length);
    const step = Math.max(1, Math.floor(stops.length / markerCount));

    return Array.from({ length: markerCount }, (_, index) => {
      const stopIndex = Math.min(index * step, stops.length - 1);
      const stop = stops[stopIndex];

      return {
        id: `vehicle-${index + 1}`,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopName: stop.stopName,
      };
    });
  }, [stops, activeVehicleCount]);

  if (positions.length < 2) {
    return (
      <div className="h-56 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        Not enough stop points to draw a route line.
      </div>
    );
  }

  return (
    <div className="h-56 overflow-hidden rounded-xl border border-gray-200">
      <MapContainer center={positions[0]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: '#15803d', weight: 5 }} />

        {stops.map((stop, index) => {
          const isBoarding = index === 0;
          const isDestination = index === stops.length - 1;

          const color = isBoarding ? '#15803d' : isDestination ? '#b91c1c' : '#475569';
          const radius = isBoarding || isDestination ? 8 : 5;

          return (
            <CircleMarker
              key={stop.stopId}
              center={[stop.latitude, stop.longitude]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{stop.stopName}</p>
                  <p>
                    {isBoarding
                      ? 'Boarding stop'
                      : isDestination
                        ? 'Destination stop'
                        : `Stop order: ${stop.order}`}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {vehicleMarkers.map((vehicle) => (
          <CircleMarker
            key={vehicle.id}
            center={[vehicle.latitude, vehicle.longitude]}
            radius={6}
            pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.95 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{vehicle.id}</p>
                <p>Near: {vehicle.stopName}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
