'use client';

import { useMemo, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { sampleTransitData } from '@/data/sampleTransitData';

type SubmissionKind = 'route' | 'fare' | 'stop';

interface StopInputRow {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  avgTimeToNextStop: string;
}

export default function DriverPage() {
  const [submittedBy, setSubmittedBy] = useState('');
  const [submissionType, setSubmissionType] = useState<SubmissionKind>('route');
  const [routeName, setRouteName] = useState('');
  const [transportType, setTransportType] = useState<'micro' | 'tempo'>('micro');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState(sampleTransitData.routes[0]?.id ?? '');
  const [fareFromStopId, setFareFromStopId] = useState('');
  const [fareToStopId, setFareToStopId] = useState('');
  const [fareAmount, setFareAmount] = useState('');
  const [note, setNote] = useState('');
  const [statusText, setStatusText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState<'active' | 'inactive'>('active');
  const [currentStopOrder, setCurrentStopOrder] = useState('1');
  const [nextStopOrder, setNextStopOrder] = useState('2');
  const [vehicleStatusText, setVehicleStatusText] = useState('');
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);

  const selectedRouteStops = useMemo(() => {
    const ordered = sampleTransitData.routeStops
      .filter((routeStop) => routeStop.routeId === selectedRouteId)
      .sort((a, b) => a.order - b.order);

    return ordered
      .map((routeStop) => {
        const stop = sampleTransitData.stops.find((item) => item.id === routeStop.stopId);
        if (!stop) {
          return null;
        }

        return {
          id: stop.id,
          name: stop.name,
          order: routeStop.order,
        };
      })
      .filter((stop): stop is { id: string; name: string; order: number } => stop !== null);
  }, [selectedRouteId]);

  const [stops, setStops] = useState<StopInputRow[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      latitude: '',
      longitude: '',
      avgTimeToNextStop: '5',
    },
    {
      id: crypto.randomUUID(),
      name: '',
      latitude: '',
      longitude: '',
      avgTimeToNextStop: '0',
    },
  ]);

  const canSubmit = useMemo(() => {
    if (!submittedBy.trim()) {
      return false;
    }

    if (submissionType === 'route') {
      return (
        routeName.trim().length > 0 &&
        startPoint.trim().length > 0 &&
        endPoint.trim().length > 0 &&
        stops.length >= 2 &&
        stops.every((stop) => stop.name.trim().length > 0)
      );
    }

    if (submissionType === 'fare') {
      return (
        selectedRouteId.length > 0 &&
        fareFromStopId.length > 0 &&
        fareToStopId.length > 0 &&
        fareFromStopId !== fareToStopId &&
        Number(fareAmount) > 0
      );
    }

    return selectedRouteId.length > 0 && note.trim().length > 0;
  }, [
    submittedBy,
    submissionType,
    routeName,
    startPoint,
    endPoint,
    stops,
    selectedRouteId,
    fareFromStopId,
    fareToStopId,
    fareAmount,
    note,
  ]);

  const canUpdateVehicle =
    selectedRouteId.length > 0 &&
    vehicleLabel.trim().length > 0 &&
    Number(currentStopOrder) >= 1 &&
    Number(nextStopOrder) >= 1;

  const addStopRow = () => {
    setStops((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        latitude: '',
        longitude: '',
        avgTimeToNextStop: '5',
      },
    ]);
  };

  const removeStopRow = (id: string) => {
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((stop) => stop.id !== id)));
  };

  const updateStopRow = (id: string, key: keyof StopInputRow, value: string) => {
    setStops((prev) =>
      prev.map((stop) => (stop.id === id ? { ...stop, [key]: value } : stop))
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatusText('Submitting contribution...');

    try {
      const payload =
        submissionType === 'route'
          ? {
              name: routeName.trim(),
              type: transportType,
              startPoint: startPoint.trim(),
              endPoint: endPoint.trim(),
              stops: stops.map((stop, index) => ({
                name: stop.name.trim(),
                latitude: Number(stop.latitude) || 0,
                longitude: Number(stop.longitude) || 0,
                order: index + 1,
                avgTimeToNextStop: Number(stop.avgTimeToNextStop) || 0,
              })),
            }
          : submissionType === 'fare'
            ? {
                routeId: selectedRouteId,
                fromStopId: fareFromStopId,
                toStopId: fareToStopId,
                fareAmount: Number(fareAmount),
                note: note.trim(),
              }
            : {
                routeId: selectedRouteId,
                updateNote: note.trim(),
              };

      await addDoc(collection(db, 'submissions'), {
        submittedBy: submittedBy.trim(),
        type: submissionType,
        payload,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setStatusText('Submission saved as pending review.');
      setNote('');
      setFareAmount('');
    } catch {
      setStatusText('Could not submit. Check Firebase config and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVehicleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canUpdateVehicle || isUpdatingVehicle) {
      return;
    }

    setIsUpdatingVehicle(true);
    setVehicleStatusText('Updating vehicle status...');

    try {
      const safeLabel = vehicleLabel.trim();
      const vehicleId = `${selectedRouteId}-${safeLabel}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');

      await setDoc(
        doc(db, 'vehicles', vehicleId),
        {
          id: vehicleId,
          routeId: selectedRouteId,
          label: safeLabel,
          status: vehicleStatus,
          currentStopOrder: Number(currentStopOrder),
          nextStopOrder: Number(nextStopOrder),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setVehicleStatusText('Vehicle status updated successfully.');
    } catch {
      setVehicleStatusText('Vehicle update failed. Check Firebase configuration.');
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f4] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Driver / Contributor Interface</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <p className="text-gray-600 mb-6">
            Submit new routes, stop corrections, or fare updates. Every submission is saved as pending for admin validation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
                <input
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="Driver or contributor name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value as SubmissionKind)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="route">New Route</option>
                  <option value="fare">Fare Update</option>
                  <option value="stop">Route Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {sampleTransitData.routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {submissionType === 'route' && (
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Route name"
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value as 'micro' | 'tempo')}
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="micro">Micro</option>
                    <option value="tempo">Tempo</option>
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    placeholder="Start point"
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <input
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    placeholder="End point"
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">Stops in order</h2>
                    <button
                      type="button"
                      onClick={addStopRow}
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-emerald-50"
                    >
                      Add Stop
                    </button>
                  </div>

                  {stops.map((stop, index) => (
                    <div key={stop.id} className="grid gap-2 md:grid-cols-5">
                      <input
                        value={stop.name}
                        onChange={(e) => updateStopRow(stop.id, 'name', e.target.value)}
                        placeholder={`Stop ${index + 1} name`}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />
                      <input
                        value={stop.latitude}
                        onChange={(e) => updateStopRow(stop.id, 'latitude', e.target.value)}
                        placeholder="Latitude"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />
                      <input
                        value={stop.longitude}
                        onChange={(e) => updateStopRow(stop.id, 'longitude', e.target.value)}
                        placeholder="Longitude"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />
                      <input
                        value={stop.avgTimeToNextStop}
                        onChange={(e) => updateStopRow(stop.id, 'avgTimeToNextStop', e.target.value)}
                        placeholder="Avg min to next"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeStopRow(stop.id)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submissionType === 'fare' && (
              <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-gray-200 p-4">
                <select
                  value={fareFromStopId}
                  onChange={(e) => setFareFromStopId(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">From stop</option>
                  {selectedRouteStops.map((stop) => (
                    <option key={`from-${stop.id}`} value={stop.id}>
                      {stop.order}. {stop.name}
                    </option>
                  ))}
                </select>
                <select
                  value={fareToStopId}
                  onChange={(e) => setFareToStopId(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">To stop</option>
                  {selectedRouteStops.map((stop) => (
                    <option key={`to-${stop.id}`} value={stop.id}>
                      {stop.order}. {stop.name}
                    </option>
                  ))}
                </select>
                <input
                  value={fareAmount}
                  onChange={(e) => setFareAmount(e.target.value)}
                  placeholder="Fare amount (NPR)"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            )}

            {submissionType === 'stop' && (
              <div className="rounded-lg border border-gray-200 p-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe route or stop correction"
                  className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
              <p className="text-sm text-gray-600">{statusText}</p>
            </div>
          </form>

          <form onSubmit={handleVehicleUpdate} className="mt-10 space-y-4 rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Manual Vehicle Status Updater</h2>
            <p className="text-sm text-gray-600">
              Use this to simulate tracking by manually updating current and next stop order.
            </p>

            <div className="grid gap-3 md:grid-cols-5">
              <input
                value={vehicleLabel}
                onChange={(e) => setVehicleLabel(e.target.value)}
                placeholder="Vehicle label"
                className="rounded-lg border border-gray-300 px-3 py-2"
              />

              <select
                value={vehicleStatus}
                onChange={(e) => setVehicleStatus(e.target.value as 'active' | 'inactive')}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                value={currentStopOrder}
                onChange={(e) => setCurrentStopOrder(e.target.value)}
                placeholder="Current stop order"
                className="rounded-lg border border-gray-300 px-3 py-2"
              />

              <input
                value={nextStopOrder}
                onChange={(e) => setNextStopOrder(e.target.value)}
                placeholder="Next stop order"
                className="rounded-lg border border-gray-300 px-3 py-2"
              />

              <button
                type="submit"
                disabled={!canUpdateVehicle || isUpdatingVehicle}
                className="rounded-lg bg-emerald-800 px-3 py-2 text-white disabled:opacity-50"
              >
                {isUpdatingVehicle ? 'Updating...' : 'Update Vehicle'}
              </button>
            </div>

            <p className="text-sm text-gray-600">{vehicleStatusText}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
