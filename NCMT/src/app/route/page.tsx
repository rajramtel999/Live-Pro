import { searchRoutes } from '@/lib/routeSearchService';
import RouteCard from '@/components/RouteCard';

interface RoutePageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    mode?: string;
  }>;
}

export default async function RoutePage({ searchParams }: RoutePageProps) {
  const params = await searchParams;
  const from = (params.from ?? '').trim();
  const to = (params.to ?? '').trim();
  const mode = (params.mode ?? 'any').trim().toLowerCase();

  if (!from || !to) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Route Results</h1>
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border-l-4 border-amber-400">
            <div className="flex gap-3 sm:gap-4">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-amber-900">Missing details</h2>
                <p className="mt-2 text-sm sm:text-base text-gray-700">
                  Please enter both starting point and destination from the home page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const searchResponse = await searchRoutes(from, to, { limit: 3, mode: mode as 'any' | 'micro' | 'tempo' });

  if (!searchResponse.results.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Route Results</h1>
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border-l-4 border-red-400">
            <div className="flex gap-3 sm:gap-4">
              <span className="text-2xl flex-shrink-0">❌</span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-red-900">No routes found</h2>
                <p className="mt-2 text-sm sm:text-base text-gray-700">
                  Could not find a route from <strong className="text-gray-900">{from}</strong> to <strong className="text-gray-900">{to}</strong>.
                </p>
                <p className="mt-3 text-xs sm:text-sm text-gray-600">
                  💡 Try using major landmark names or check the stop map on the home page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
            ✅ {searchResponse.results.length} Route{searchResponse.results.length !== 1 ? 's' : ''} Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Route Results</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            From <span className="font-semibold text-gray-900">{from}</span> to <span className="font-semibold text-gray-900">{to}</span> · Mode <span className="font-semibold text-gray-900 capitalize">{mode}</span>
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {searchResponse.results.map((result, index) => (
            <RouteCard key={result.routeId} result={result} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
