'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RouteDoc, RouteStopDoc, StopDoc } from '@/types/transit';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';
import { formatETA, formatDistance, estimateETA } from '@/lib/etaCalculator';
import Link from 'next/link';

const LiveMapView = dynamic(() => import('@/components/LiveMapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] bg-slate-900 rounded-2xl">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent mb-3" />
        <p className="text-slate-400 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

interface StopWithCoords {
  latitude: number;
  longitude: number;
  stopName: string;
  order: number;
}

interface RouteWithStops {
  route: RouteDoc;
  stops: StopWithCoords[];
}

export default function LiveTrackingPage() {
  const [routes, setRoutes] = useState<RouteWithStops[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [routesSnap, routeStopsSnap, stopsSnap] = await Promise.all([
          getDocs(collection(db, 'routes')),
          getDocs(collection(db, 'routeStops')),
          getDocs(collection(db, 'stops')),
        ]);

        const routesDocs = routesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RouteDoc));
        const routeStopsDocs = routeStopsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RouteStopDoc));
        const stopsDocs = stopsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as StopDoc));

        const built: RouteWithStops[] = routesDocs
          .filter((r) => r.isApproved)
          .map((route) => {
            const stops = routeStopsDocs
              .filter((rs) => rs.routeId === route.id)
              .sort((a, b) => a.order - b.order)
              .map((rs) => {
                const stop = stopsDocs.find((s) => s.id === rs.stopId);
                if (!stop) return null;
                return { latitude: stop.latitude, longitude: stop.longitude, stopName: stop.name, order: rs.order };
              })
              .filter(Boolean) as StopWithCoords[];
            return { route, stops };
          });

        setRoutes(built);
        if (built.length > 0) setSelectedRouteId(built[0].route.id);
      } catch (e) {
        console.error('Failed to load routes', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedRoute = routes.find((r) => r.route.id === selectedRouteId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 shadow-sm px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🗺️ Live Tracking</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time vehicle positions across all routes</p>
          </div>
          <Link
            href="/driver/live"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-200"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Go Live as Driver
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-r-transparent animate-spin" />
            <p className="text-gray-500">Loading routes…</p>
          </div>
        ) : routes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Left — map */}
            <div className="space-y-4">
              {/* Route selector */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <label className="text-gray-500 text-sm font-medium whitespace-nowrap">Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {routes.map((r) => (
                    <option key={r.route.id} value={r.route.id}>
                      {r.route.name} ({r.route.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Map */}
              {selectedRoute && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ height: 520 }}>
                  <LiveMapView
                    routeId={selectedRoute.route.id}
                    stops={selectedRoute.stops}
                    routeName={selectedRoute.route.name}
                  />
                </div>
              )}
            </div>

            {/* Right — sidebar */}
            {selectedRoute && (
              <VehicleSidebar
                routeId={selectedRoute.route.id}
                stops={selectedRoute.stops}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function VehicleSidebar({ routeId, stops }: { routeId: string; stops: StopWithCoords[] }) {
  const { vehicles, vehicleCount, isConnected } = useVehicleTracking(routeId);

  return (
    <aside className="space-y-4">
      {/* Connection status */}
      <div className={`rounded-2xl p-4 border ${isConnected
        ? 'bg-green-50 border-green-200'
        : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-800">
            {isConnected ? 'Connected to Firebase' : 'Connecting…'}
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          {vehicleCount} active vehicle{vehicleCount !== 1 ? 's' : ''} on this route
        </p>
      </div>

      {/* Vehicle list */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Vehicles</h2>

        {vehicleCount === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🚌</div>
            <p className="text-gray-500 text-sm">No vehicles on route</p>
            <p className="text-gray-400 text-xs mt-1">Waiting for drivers to go live…</p>
          </div>
        ) : (
          Object.entries(vehicles).map(([vehicleId, pos]) => {
            const nextStop = stops[Math.min(pos.nextStopIndex, stops.length - 1)];
            const eta = nextStop
              ? estimateETA(pos.latitude, pos.longitude, nextStop.latitude, nextStop.longitude, pos.speed)
              : null;
            return (
              <div key={vehicleId} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-900">🚌 {vehicleId}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    pos.status === 'moving'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {pos.status === 'moving' ? '● Moving' : '■ Stopped'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <SidebarStat label="Speed" value={`${pos.speed.toFixed(0)} km/h`} />
                  {eta && (
                    <>
                      <SidebarStat label="ETA" value={formatETA(eta.etaMinutes)} highlight />
                      <SidebarStat label="Distance" value={formatDistance(eta.distanceMetres)} />
                      <SidebarStat label="Next Stop" value={nextStop?.stopName ?? '—'} />
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stops list */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Route Stops</h2>
        <ol className="space-y-1.5">
          {stops.map((stop, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                i === 0 ? 'bg-emerald-600' : i === stops.length - 1 ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {i + 1}
              </span>
              <span className="text-gray-700 truncate">{stop.stopName}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

function SidebarStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🗺️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No routes available</h2>
      <p className="text-gray-500 text-sm max-w-sm">
        No approved routes found. Add routes via the Driver or Admin portal.
      </p>
      <Link href="/driver" className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
        Go to Driver Portal
      </Link>
    </div>
  );
}
