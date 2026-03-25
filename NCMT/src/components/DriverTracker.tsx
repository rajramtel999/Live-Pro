'use client';

import { useState, useEffect } from 'react';
import { useDriverTracking } from '@/hooks/useDriverTracking';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RouteDoc } from '@/types/transit';
import { formatDistance } from '@/lib/etaCalculator';

export default function DriverTracker() {
  const { isTracking, lastPosition, error, startTracking, stopTracking } =
    useDriverTracking();

  const [routes, setRoutes] = useState<RouteDoc[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'routes'))
      .then((snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as RouteDoc))
          .filter((r) => r.isApproved);
        setRoutes(docs);
        if (docs.length > 0) setSelectedRouteId(docs[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingRoutes(false));
  }, []);

  const vehicleId = vehicleLabel.trim()
    ? `${selectedRouteId}-${vehicleLabel.trim().toLowerCase().replace(/\s+/g, '-')}`
    : '';

  const handleToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      if (!vehicleId || !selectedRouteId) return;
      startTracking(vehicleId, selectedRouteId, vehicleLabel);
    }
  };

  const canStart = !!vehicleLabel.trim() && !!selectedRouteId;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`rounded-2xl p-5 flex items-center gap-4 transition-all duration-500 border ${
          isTracking
            ? 'bg-green-50 border-green-300'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Pulse dot */}
        <span className="relative flex h-4 w-4 flex-shrink-0">
          {isTracking ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
            </>
          ) : (
            <span className="inline-flex rounded-full h-4 w-4 bg-gray-300" />
          )}
        </span>
        <div>
          <p className="text-gray-900 font-semibold">
            {isTracking ? '🟢 GPS Broadcasting Active' : '⚪ Not Tracking'}
          </p>
          <p className="text-gray-500 text-sm">
            {isTracking
              ? 'Your location is being shared in real-time'
              : 'Start tracking to broadcast your position'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Config Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Route
          </label>
          {loadingRoutes ? (
            <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              disabled={isTracking}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {routes.length === 0 && (
                <option value="">No approved routes</option>
              )}
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Label
          </label>
          <input
            value={vehicleLabel}
            onChange={(e) => setVehicleLabel(e.target.value)}
            disabled={isTracking}
            placeholder="e.g. BUS-01 or your name"
            className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          {vehicleId && (
            <p className="text-gray-400 text-xs mt-1">ID: {vehicleId}</p>
          )}
        </div>
      </div>

      {/* Start / Stop */}
      <button
        onClick={handleToggle}
        disabled={!isTracking && !canStart}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-40 ${
          isTracking
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-200'
        }`}
      >
        {isTracking ? '⏹ Stop Broadcasting' : '▶ Start GPS Broadcasting'}
      </button>

      {/* Live Position Card */}
      {lastPosition && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
            Live Position
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Latitude" value={lastPosition.latitude.toFixed(6)} />
            <Stat label="Longitude" value={lastPosition.longitude.toFixed(6)} />
            <Stat
              label="Speed"
              value={
                lastPosition.speed != null
                  ? `${lastPosition.speed.toFixed(1)} km/h`
                  : 'N/A'
              }
            />
            <Stat
              label="Accuracy"
              value={formatDistance(Math.round(lastPosition.accuracy))}
            />
            <Stat
              label="Heading"
              value={
                lastPosition.heading != null
                  ? `${Math.round(lastPosition.heading)}°`
                  : 'N/A'
              }
            />
            <Stat
              label="Updated"
              value={new Date(lastPosition.timestamp).toLocaleTimeString()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-gray-900 text-sm font-mono font-semibold">{value}</p>
    </div>
  );
}
