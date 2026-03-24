import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  TRANSIT_COLLECTIONS,
  type FareDoc,
  type RouteDoc,
  type RouteStopDoc,
  type StopDoc,
  type SubmissionDoc,
  type TransitCollectionDocMap,
  type TransitCollectionName,
  type VehicleDoc,
} from '@/types/transit';

async function getCollectionDocs<K extends keyof TransitCollectionDocMap>(
  collectionName: K,
  constraints: QueryConstraint[] = []
): Promise<TransitCollectionDocMap[K][]> {
  const ref = collection(db, TRANSIT_COLLECTIONS[collectionName]);
  const q = constraints.length ? query(ref, ...constraints) : query(ref);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    return { id: docSnap.id, ...docSnap.data() } as TransitCollectionDocMap[K];
  });
}

export async function getApprovedRoutes(): Promise<RouteDoc[]> {
  return getCollectionDocs('routes', [where('isApproved', '==', true)]);
}

export async function getAllStops(): Promise<StopDoc[]> {
  return getCollectionDocs('stops', [orderBy('name')]);
}

export async function getRouteStopsByRoute(routeId: string): Promise<RouteStopDoc[]> {
  return getCollectionDocs('routeStops', [
    where('routeId', '==', routeId),
    orderBy('order', 'asc'),
  ]);
}

export async function getFareByStops(
  routeId: string,
  fromStopId: string,
  toStopId: string
): Promise<FareDoc | null> {
  const fares = await getCollectionDocs('fares', [
    where('routeId', '==', routeId),
    where('fromStopId', '==', fromStopId),
    where('toStopId', '==', toStopId),
  ]);

  return fares[0] ?? null;
}

export async function getActiveVehiclesByRoute(routeId: string): Promise<VehicleDoc[]> {
  return getCollectionDocs('vehicles', [
    where('routeId', '==', routeId),
    where('status', '==', 'active'),
    orderBy('updatedAt', 'desc'),
  ]);
}

export async function getPendingSubmissions(): Promise<SubmissionDoc[]> {
  return getCollectionDocs('submissions', [where('status', '==', 'pending')]);
}

export async function getCollectionCount(collectionName: TransitCollectionName): Promise<number> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.size;
}
