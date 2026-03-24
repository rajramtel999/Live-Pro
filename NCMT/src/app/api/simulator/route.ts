import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { VehicleSimulator } from '@/lib/vehicleTracking';
import type { RouteDoc, RouteStopDoc, StopDoc } from '@/types/transit';

// Store active simulators in memory
const activeSimulators = new Map<string, VehicleSimulator>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, routeId, vehicleId } = body;

    if (!action || !routeId || !vehicleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'start') {
      // Check if already running
      if (activeSimulators.has(vehicleId)) {
        return NextResponse.json({
          success: false,
          error: 'Simulator already running for this vehicle',
        });
      }

      // Fetch route stops
      const routeStopsSnapshot = await getDocs(collection(firestore, 'routeStops'));
      const routeStopsDocs = routeStopsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as RouteStopDoc))
        .filter((rs) => rs.routeId === routeId)
        .sort((a, b) => a.order - b.order);

      // Fetch stops coordinates
      const stopsSnapshot = await getDocs(collection(firestore, 'stops'));
      const stopsDocs = stopsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as StopDoc)
      );

      const routeStopsWithCoords = routeStopsDocs
        .map((rs) => {
          const stop = stopsDocs.find((s) => s.id === rs.stopId);
          if (!stop) return null;
          return {
            ...rs,
            latitude: stop.latitude,
            longitude: stop.longitude,
          };
        })
        .filter((s) => s !== null) as (RouteStopDoc & {
        latitude: number;
        longitude: number;
      })[];

      if (routeStopsWithCoords.length < 2) {
        return NextResponse.json({
          success: false,
          error: 'Route must have at least 2 stops',
        });
      }

      // Create and start simulator
      const simulator = new VehicleSimulator(
        vehicleId,
        routeId,
        routeStopsWithCoords
      );

      simulator.start();
      activeSimulators.set(vehicleId, simulator);

      return NextResponse.json({
        success: true,
        message: `Started simulator for vehicle ${vehicleId}`,
      });
    } else if (action === 'stop') {
      const simulator = activeSimulators.get(vehicleId);

      if (!simulator) {
        return NextResponse.json({
          success: false,
          error: 'No active simulator for this vehicle',
        });
      }

      simulator.stop();
      activeSimulators.delete(vehicleId);

      return NextResponse.json({
        success: true,
        message: `Stopped simulator for vehicle ${vehicleId}`,
      });
    } else if (action === 'stopAll') {
      activeSimulators.forEach((simulator) => simulator.stop());
      activeSimulators.clear();

      return NextResponse.json({
        success: true,
        message: 'Stopped all simulators',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Simulator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    activeSimulators: Array.from(activeSimulators.keys()),
    count: activeSimulators.size,
  });
}
