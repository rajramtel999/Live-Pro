'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';
import { estimateETA, formatDistance, formatETA } from '@/lib/etaCalculator';
import { getStreetRoutePolyline } from '@/lib/routing';

// Lazy-load all react-leaflet components for SSR compatibility
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import('react-leaflet').then((m) => m.TileLayer),    { ssr: false });
const Polyline     = dynamic(() => import('react-leaflet').then((m) => m.Polyline),     { ssr: false });
const Marker       = dynamic(() => import('react-leaflet').then((m) => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import('react-leaflet').then((m) => m.Popup),        { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });

interface Stop {
  latitude: number;
  longitude: number;
  stopName: string;
}

interface LiveMapViewProps {
  routeId: string;
  stops: Stop[];
  routeName: string;
}

export default function LiveMapView({ routeId, stops, routeName }: LiveMapViewProps) {
  const { vehicles, vehicleCount, isConnected } = useVehicleTracking(routeId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [L, setL] = useState<any>(null);
  const prevPositions = useRef<Record<string, { lat: number; lng: number }>>({});
  
  // Custom street-routed polyline state
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // Load Leaflet only on client
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Fetch the actual polyline
  useEffect(() => {
    if (stops.length < 2) return;
    const baseCoords: [number, number][] = stops.map(s => [s.latitude, s.longitude]);
    getStreetRoutePolyline(baseCoords).then(setRouteCoords);
  }, [stops]);

  if (stops.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900 text-slate-400 rounded-xl">
        No route data available
      </div>
    );
  }

  const center: [number, number] = [stops[0].latitude, stops[0].longitude];

  // Create a custom rotated vehicle icon
  const createVehicleIcon = (heading: number, isMoving: boolean) => {
    if (!L) return undefined;
    const color = isMoving ? '#22c55e' : '#f59e0b';
    const pulse = isMoving
      ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:.25;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;"></div>`
      : '';
    return L.divIcon({
      html: `
        <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
        <div style="position:relative;width:36px;height:36px;">
          ${pulse}
          <div style="transform:rotate(${heading}deg);transition:transform 0.8s ease;width:36px;height:36px;">
            <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="2.5"/>
              <path d="M18 8 L24 22 L18 19 L12 22 Z" fill="white"/>
            </svg>
          </div>
        </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Track position changes for smooth transitions
  Object.entries(vehicles).forEach(([id, v]) => {
    prevPositions.current[id] = { lat: v.latitude, lng: v.longitude };
  });

  return (
    <div className="relative flex flex-col h-full">
      {/* Map header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div>
          <h3 className="text-gray-900 font-semibold text-sm">🗺️ {routeName}</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {stops.length} stops · {stops[0].stopName} → {stops[stops.length - 1].stopName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isConnected ? 'Live' : 'Connecting…'}
          </span>
          <span className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1" style={{ minHeight: 420 }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%', minHeight: 420 }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Route polyline */}
          <Polyline positions={routeCoords} color="#3b82f6" weight={4} opacity={0.7} />

          {/* Stop markers */}
          {stops.map((stop, i) => (
            <CircleMarker
              key={i}
              center={[stop.latitude, stop.longitude]}
              radius={i === 0 || i === stops.length - 1 ? 10 : 7}
              fillColor={i === 0 ? '#10b981' : i === stops.length - 1 ? '#ef4444' : '#3b82f6'}
              fillOpacity={0.9}
              color="white"
              weight={2}
            >
              <Popup>
                <div className="text-xs leading-relaxed">
                  <strong>{stop.stopName}</strong>
                  {i === 0 && <><br />🚩 Start</>}
                  {i === stops.length - 1 && <><br />🏁 End</>}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Live vehicle markers */}
          {L &&
            Object.entries(vehicles).map(([vehicleId, pos]) => {
              const isMoving = pos.status === 'moving';
              const nextStop = stops[Math.min(pos.nextStopIndex, stops.length - 1)];
              const eta = nextStop
                ? estimateETA(pos.latitude, pos.longitude, nextStop.latitude, nextStop.longitude, pos.speed)
                : null;
              return (
                <Marker
                  key={vehicleId}
                  position={[pos.latitude, pos.longitude]}
                  icon={createVehicleIcon(pos.heading, isMoving)}
                >
                  <Popup>
                    <div className="text-xs leading-relaxed min-w-[160px]">
                      <div className="font-bold text-sm mb-1">🚌 {vehicleId}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-gray-500">Speed</span>
                        <span className="font-medium">{pos.speed.toFixed(1)} km/h</span>
                        <span className="text-gray-500">Status</span>
                        <span className={`font-medium ${isMoving ? 'text-green-600' : 'text-amber-600'}`}>
                          {isMoving ? '● Moving' : '■ Stopped'}
                        </span>
                        {eta && (
                          <>
                            <span className="text-gray-500">Next stop</span>
                            <span className="font-medium">{nextStop?.stopName}</span>
                            <span className="text-gray-500">ETA</span>
                            <span className="font-medium text-blue-600">{formatETA(eta.etaMinutes)}</span>
                            <span className="text-gray-500">Distance</span>
                            <span className="font-medium">{formatDistance(eta.distanceMetres)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* No vehicles overlay */}
        {isConnected && vehicleCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-10 pointer-events-none">
            <div className="text-center">
              <div className="text-4xl mb-3">🚌</div>
              <p className="text-white font-semibold">No active vehicles</p>
              <p className="text-slate-400 text-sm mt-1">Waiting for drivers to go live…</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-6 text-xs text-gray-500 flex-wrap">
        <LegendItem color="#10b981" label="Start" />
        <LegendItem color="#ef4444" label="End" />
        <LegendItem color="#3b82f6" label="Stop" />
        <LegendItem color="#22c55e" label="Moving" />
        <LegendItem color="#f59e0b" label="Stopped" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
