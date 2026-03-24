import { searchRoutes } from '@/lib/routeSearchService';
import RouteCard from '@/components/RouteCard';

interface RoutePageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function RoutePage({ searchParams }: RoutePageProps) {
  const params = await searchParams;
  const from = (params.from ?? '').trim();
  const to = (params.to ?? '').trim();

  if (!from || !to) {
    return (
      <div className="min-h-screen bg-[#f4f8f4] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Route Results</h1>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200">
            <h2 className="text-xl font-semibold text-amber-700">Missing search details</h2>
            <p className="mt-2 text-gray-600">
              Please enter both starting point and destination from the home page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const searchResponse = await searchRoutes(from, to, { limit: 3 });

  if (!searchResponse.results.length) {
    return (
      <div className="min-h-screen bg-[#f4f8f4] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Route Results</h1>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-rose-200">
            <h2 className="text-xl font-semibold text-red-700">No route found</h2>
            <p className="mt-2 text-gray-600">
              We could not find a direct route from <strong>{from}</strong> to <strong>{to}</strong>.
            </p>
            <p className="mt-3 text-gray-500">
              Try nearby landmark names or shorter stop names.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f4] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Route Results</h1>
          <p className="mt-2 text-gray-600">
            Showing {searchResponse.results.length} options from <strong>{from}</strong> to <strong>{to}</strong>
          </p>
        </div>

        <div className="space-y-4">
          {searchResponse.results.map((result, index) => (
            <RouteCard key={result.routeId} result={result} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
