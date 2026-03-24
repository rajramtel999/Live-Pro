'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { subscribeToRouteVehicles, type VehiclePosition } from '@/lib/vehicleTracking';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

interface LiveMapViewProps {
  routeId: string;
  stops: Array<{
    latitude: number;
    longitude: number;
    stopName: string;
  }>;
  routeName: string;
}

export default function LiveMapView({ routeId, stops, routeName }: LiveMapViewProps) {
  const [vehicles, setVehicles] = useState<Record<string, VehiclePosition>>({});
  const [L, setL] = useState<any>(null);

  // Load Leaflet only on client side
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Subscribe to real-time vehicle updates
  useEffect(() => {
    const unsubscribe = subscribeToRouteVehicles(routeId, (updatedVehicles) => {
      setVehicles(updatedVehicles);
    });

    return () => unsubscribe();
  }, [routeId]);

  if (stops.length === 0) {
    return <div className="text-gray-500">No route data available</div>;
  }

  const center: [number, number] = [stops[0].latitude, stops[0].longitude];
  const pathCoordinates: [number, number][] = stops.map((stop) => [
    stop.latitude,
    stop.longitude,
  ]);

  // Create custom bus icon
  const createBusIcon = (heading: number) => {
    if (!L) return undefined;

    return L.divIcon({
      html: `
        <div style="transform: rotate(${heading}deg); transition: transform 0.5s ease;">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <path d="M16 8L20 16H12L16 8Z" fill="white"/>
          </svg>
        </div>
      `,
      className: 'custom-bus-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-white font-semibold text-lg">🚍 Live Vehicle Tracking</h3>
          <p className="text-blue-100 text-sm">{routeName}</p>
        </div>

        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '500px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Route path */}
          <Polyline positions={pathCoordinates} color="#3b82f6" weight={4} opacity={0.6} />

          {/* Stop markers */}
          {stops.map((stop, index) => (
            <CircleMarker
              key={index}
              center={[stop.latitude, stop.longitude]}
              radius={8}
              fillColor={index === 0 ? '#10b981' : index === stops.length - 1 ? '#ef4444' : '#fbbf24'}
              fillOpacity={0.8}
              color="white"
              weight={2}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{stop.stopName}</strong>
                  <br />
                  {index === 0 && '🚩 Start'}
                  {index === stops.length - 1 && '🏁 End'}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Live vehicle markers */}
          {L && Object.entries(vehicles).map(([vehicleId, position]) => (
            <Marker
              key={vehicleId}
              position={[position.latitude, position.longitude]}
              icon={createBusIcon(position.heading)}
            >
              <Popup>
                <div className="text-sm">
                  <strong>🚌 Vehicle {vehicleId}</strong>
                  <br />
                  Speed: {position.speed} km/h
                  <br />
                  Status: {position.status === 'moving' ? '🟢 Moving' : '🔴 Stopped'}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Vehicle count badge */}
        <div className="p-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {Object.keys(vehicles).length} Active Vehicle{Object.keys(vehicles).length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Real-time tracking
          </div>
        </div>
      </div>
    </div>
  );
}
