import DriverTracker from '@/components/DriverTracker';
import Link from 'next/link';

export default function DriverLivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50">
      {/* Top bar */}
      <header className="bg-white border-b border-emerald-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚌</span>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">Driver Live Mode</h1>
            <p className="text-gray-500 text-xs mt-0.5">GPS broadcasting dashboard</p>
          </div>
        </div>
        <Link
          href="/live-tracking"
          className="text-sm text-emerald-700 hover:text-emerald-900 transition border border-emerald-200 hover:border-emerald-400 bg-white rounded-lg px-3 py-2 font-medium"
        >
          👁 Rider View
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Info banner */}
        <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">📡</span>
          <div>
            <p className="text-blue-800 text-sm font-semibold mb-0.5">How it works</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Select your route, enter a vehicle label, and tap{' '}
              <strong>Start GPS Broadcasting</strong>. Your device GPS will stream
              your location to Firebase in real-time — riders can see you moving on
              the map instantly.
            </p>
          </div>
        </div>

        {/* Main tracker component */}
        <DriverTracker />

        {/* Tips */}
        <div className="mt-8 space-y-3">
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tips</h2>
          {[
            ['🔋', 'Keep your screen on to maintain continuous GPS broadcasting'],
            ['📶', 'A stable data connection ensures real-time updates to riders'],
            ['🎯', 'Enable high-accuracy GPS in device settings for best results'],
          ].map(([icon, tip]) => (
            <div key={tip} className="flex gap-3 text-sm text-gray-500">
              <span>{icon}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
