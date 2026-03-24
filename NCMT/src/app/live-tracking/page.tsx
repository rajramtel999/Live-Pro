'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import LiveMapView from '@/components/LiveMapView';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { RouteDoc, RouteStopDoc, StopDoc } from '@/types/transit';

interface RouteWithStops {
  route: RouteDoc;
  stops: Array<{
    latitude: number;
    longitude: number;
    stopName: string;
    order: number;
  }>;
}

export default function LiveTrackingPage() {
  const [routes, setRoutes] = useState<RouteWithStops[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  async function fetchRoutes() {
    try {
      // Fetch routes
      const routesSnapshot = await getDocs(collection(firestore, 'routes'));
      const routesDocs = routesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as RouteDoc)
      );

      // Fetch route stops
      const routeStopsSnapshot = await getDocs(collection(firestore, 'routeStops'));
      const routeStopsDocs = routeStopsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as RouteStopDoc)
      );

      // Fetch stops
      const stopsSnapshot = await getDocs(collection(firestore, 'stops'));
      const stopsDocs = stopsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as StopDoc)
      );

      // Combine data
      const routesWithStops: RouteWithStops[] = routesDocs
        .filter((route) => route.isApproved)
        .map((route) => {
          const routeStops = routeStopsDocs
            .filter((rs) => rs.routeId === route.id)
            .sort((a, b) => a.order - b.order);

          const stops = routeStops
            .map((rs) => {
              const stop = stopsDocs.find((s) => s.id === rs.stopId);
              if (!stop) return null;
              return {
                latitude: stop.latitude,
                longitude: stop.longitude,
                stopName: stop.name,
                order: rs.order,
              };
            })
            .filter((s) => s !== null) as RouteWithStops['stops'];

          return { route, stops };
        });

      setRoutes(routesWithStops);
      if (routesWithStops.length > 0) {
        setSelectedRouteId(routesWithStops[0].route.id);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedRoute = routes.find((r) => r.route.id === selectedRouteId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚍 Live Vehicle Tracking
          </h1>
          <p className="text-gray-600">
            Track vehicles in real-time as they move along their routes
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No routes available for tracking</p>
          </div>
        ) : (
          <>
            {/* Route selector */}
            <div className="mb-6">
              <label htmlFor="route-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Route
              </label>
              <select
                id="route-select"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {routes.map((r) => (
                  <option key={r.route.id} value={r.route.id}>
                    {r.route.name} ({r.route.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Live map */}
            {selectedRoute && (
              <LiveMapView
                routeId={selectedRoute.route.id}
                stops={selectedRoute.stops}
                routeName={selectedRoute.route.name}
              />
            )}

            {/* Info card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Live Tracking Demo</h3>
                  <p className="text-blue-800 text-sm">
                    Vehicles are shown in real-time as they move along the route.
                    Blue arrows indicate vehicle direction, and the map updates automatically.
                    Click on any vehicle to see its current speed and status.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
