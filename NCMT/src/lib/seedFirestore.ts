import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { sampleTransitData } from '@/data/sampleTransitData';
import {
  TRANSIT_COLLECTIONS,
  type TransitCollectionListMap,
} from '@/types/transit';

export async function seedFirestoreData() {
  const batch = writeBatch(db);

  const collectionsToSeed: TransitCollectionListMap = {
    routes: sampleTransitData.routes,
    stops: sampleTransitData.stops,
    routeStops: sampleTransitData.routeStops,
    fares: sampleTransitData.fares,
    vehicles: sampleTransitData.vehicles,
    submissions: sampleTransitData.submissions,
  };

  (Object.keys(collectionsToSeed) as Array<keyof TransitCollectionListMap>).forEach(
    (collectionKey) => {
      const docs = collectionsToSeed[collectionKey];

      docs.forEach((item) => {
        batch.set(
          doc(collection(db, TRANSIT_COLLECTIONS[collectionKey]), item.id),
          item
        );
      });
    }
  );

  await batch.commit();

  return Object.fromEntries(
    (Object.keys(collectionsToSeed) as Array<keyof TransitCollectionListMap>).map(
      (collectionKey) => [collectionKey, collectionsToSeed[collectionKey].length]
    )
  );
}
