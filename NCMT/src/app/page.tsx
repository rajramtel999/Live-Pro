'use client';

import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f8f4]">
      {/* Hero Section */}
      <div className="bg-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="inline-block rounded-full border border-emerald-300/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
            Kathmandu Transit MVP
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
            Professional Route Guidance for Daily Commute
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-100">
            Search routes, estimate fares, and check vehicle availability using community-powered transit data.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl p-8 border border-emerald-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Find Your Route</h2>
          <SearchForm />
        </div>
      </div>

      {/* Info Section */}
      <div className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Search</h3>
              <p className="text-gray-600">Enter your starting point and destination</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
              <h3 className="text-xl font-bold mb-2">View Routes</h3>
              <p className="text-gray-600">See available routes with fares and timing</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Book Travel</h3>
              <p className="text-gray-600">Get on board with confidence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
