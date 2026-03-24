'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sampleTransitData } from '@/data/sampleTransitData';

export default function SearchForm() {
  const router = useRouter();
  const [startingPoint, setStartingPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const stopSuggestions = sampleTransitData.stops
    .map((stop) => stop.name)
    .sort((a, b) => a.localeCompare(b));

  const canSubmit = startingPoint.trim().length > 0 && destination.trim().length > 0;

  const handleSwap = () => {
    setStartingPoint(destination);
    setDestination(startingPoint);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      alert('Please enter both starting point and destination');
      return;
    }

    setLoading(true);
    // Navigate to route page with search params
    router.push(`/route?from=${encodeURIComponent(startingPoint.trim())}&to=${encodeURIComponent(destination.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-5">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Starting Point</label>
          <input
            type="text"
            value={startingPoint}
            onChange={(e) => setStartingPoint(e.target.value)}
            placeholder="E.g., Ratna Park"
            list="stop-suggestions"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-emerald-50"
          aria-label="Swap starting point and destination"
        >
          Swap
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="E.g., Bouddhanath"
            list="stop-suggestions"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <datalist id="stop-suggestions">
        {stopSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <p className="text-sm text-gray-500">
        Tip: use landmark names from major stops for best matching.
      </p>

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Search Routes'}
      </button>
    </form>
  );
}
