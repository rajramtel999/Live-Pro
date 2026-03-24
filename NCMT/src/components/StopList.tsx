import type { RouteSearchStopSequenceItem } from '@/types/searchResult';

interface StopListProps {
  stops: RouteSearchStopSequenceItem[];
}

export default function StopList({ stops }: StopListProps) {
  if (!stops.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        No stops available for this route segment.
      </div>
    );
  }

  return (
    <ol className="space-y-2 text-sm text-gray-700">
      {stops.map((stop, index) => {
        const isFirst = index === 0;
        const isLast = index === stops.length - 1;

        return (
          <li key={stop.stopId} className="flex items-center gap-3">
            <span
              className={[
                'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                isFirst
                  ? 'bg-emerald-100 text-emerald-700'
                  : isLast
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {stop.order}
            </span>
            <div>
              <p className="font-medium">{stop.stopName}</p>
              {!isLast && (
                <p className="text-xs text-gray-500">
                  Avg time to next stop: {stop.avgTimeToNextStop} min
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
