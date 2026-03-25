'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sampleTransitData } from '@/data/sampleTransitData';

export default function SearchForm() {
  const router = useRouter();
  const [startingPoint, setStartingPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('any');
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
    router.push(`/route?from=${encodeURIComponent(startingPoint.trim())}&to=${encodeURIComponent(destination.trim())}&mode=${encodeURIComponent(mode)}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Mobile: Stack vertically, Desktop: 3-column with swap button */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 lg:items-end">
        {/* Starting Point */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
          <input
            type="text"
            value={startingPoint}
            onChange={(e) => setStartingPoint(e.target.value)}
            placeholder="Starting point"
            list="stop-suggestions"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
            autoComplete="off"
          />
        </div>

        {/* Swap Button - Mobile: Full width, Desktop: Auto */}
        <button
          type="button"
          onClick={handleSwap}
          className="h-12 lg:h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-50 transition touch-manipulation lg:w-auto"
          aria-label="Swap starting point and destination"
        >
          <span className="hidden lg:inline">⇅ Swap</span>
          <span className="lg:hidden">⇅</span>
        </button>

        {/* Destination */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
            list="stop-suggestions"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
            autoComplete="off"
          />
        </div>
      </div>

      <datalist id="stop-suggestions">
        {stopSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
        >
          <option value="any">Any (micro-bus or tempo)</option>
          <option value="micro">Micro-bus</option>
          <option value="tempo">Tempo</option>
        </select>
      </div>

      <p className="text-xs sm:text-sm text-gray-500 px-1">
        💡 Tip: Use major landmark names (e.g., "Ratna Park", "Bouddhanath")
      </p>

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full bg-emerald-700 text-white py-4 sm:py-3 rounded-lg font-semibold hover:bg-emerald-800 active:bg-emerald-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-base touch-manipulation"
      >
        {loading ? '🔄 Searching...' : '🔍 Find Routes'}
      </button>
    </form>
  );
}
