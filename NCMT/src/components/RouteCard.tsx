'use client';

import type { RouteSearchResult } from '@/types/searchResult';
import StopList from '@/components/StopList';
import FareDisplay from '@/components/FareDisplay';
import ETABadge from '@/components/ETABadge';
import AvailabilityChip from '@/components/AvailabilityChip';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
});

interface RouteCardProps {
  result: RouteSearchResult;
  rank: number;
}

export default function RouteCard({ result, rank }: RouteCardProps) {
  return (
    <article className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Suggested route #{rank}
          </p>
          <h2 className="text-xl font-bold text-slate-800">{result.routeName}</h2>
          <p className="text-sm text-gray-600 capitalize">{result.transportType}</p>
        </div>
        <AvailabilityChip availability={result.availability} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FareDisplay amount={result.estimatedFare} />
        <ETABadge label="Wait ETA" minutes={result.estimatedWaitEtaMinutes} tone="slate" />
        <ETABadge label="Total ETA" minutes={result.estimatedTotalEtaMinutes} tone="emerald" />
      </div>

      <div className="mt-4">
        <MapView
          stops={result.stopSequence}
          activeVehicleCount={result.availability.activeCount}
        />
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        <p>
          <span className="font-medium">Boarding:</span> {result.boardingStop.name}
        </p>
        <p>
          <span className="font-medium">Destination:</span> {result.destinationStop.name}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Stop sequence</h3>
        <StopList stops={result.stopSequence} />
      </div>
    </article>
  );
}
