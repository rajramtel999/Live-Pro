'use client';

import Link from 'next/link';
import SearchForm from '@/components/SearchForm';

const stats = [
  { value: '100+', label: 'Routes Mapped' },
  { value: '500+', label: 'Stops Documented' },
  { value: '3', label: 'Districts Covered' },
  { value: '24/7', label: 'Live Tracking' },
];

const portals = [
  {
    icon: '🚌',
    title: 'Contributor Portal',
    subtitle: 'For Drivers, Conductors & Commuters',
    description:
      'Submit new micro-bus and tempo routes, report correct stop sequences, update fares between stops, and flag inaccuracies in existing data. Anyone can contribute — drivers, conductors, or daily commuters.',
    cta: 'Start Contributing',
    href: '/driver',
    color: 'emerald',
    features: ['Add route with stops & sequence', 'Submit fare corrections', 'Report route changes'],
  },
  {
    icon: '🛡️',
    title: 'Admin Dashboard',
    subtitle: 'For Transport Authority Staff',
    description:
      'Review all crowdsourced submissions, verify route accuracy against official records, approve or reject corrections, and manage the verified route database. Ensures data quality before public display.',
    cta: 'Open Dashboard',
    href: '/admin',
    color: 'blue',
    features: ['Review pending submissions', 'Approve or reject routes', 'Manage verified data'],
  },
  {
    icon: '🗺️',
    title: 'Commuter Planner',
    subtitle: 'For Daily Travellers',
    description:
      'Enter your starting point and destination anywhere in Kathmandu Valley. Get the exact micro-bus or tempo route, estimated fare, and the nearest boarding stop — all from verified crowdsourced data.',
    cta: 'Plan My Route',
    href: '#search',
    color: 'violet',
    features: ['Find exact route & stops', 'Fare estimate (NPR)', 'Live vehicle tracking'],
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; cta: string; icon: string; bullet: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    cta: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: 'bg-emerald-100 text-emerald-700',
    bullet: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    cta: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: 'bg-blue-100 text-blue-700',
    bullet: 'bg-blue-500',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    cta: 'bg-violet-600 hover:bg-violet-700 text-white',
    icon: 'bg-violet-100 text-violet-700',
    bullet: 'bg-violet-500',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-900/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 mb-5">
            🏆 Hackathon Project · Kathmandu Valley
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 max-w-4xl">
            Crowdsourced Public Transport<br className="hidden sm:block" />
            <span className="text-emerald-300"> Route Mapper</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-emerald-100 mb-8 leading-relaxed">
            Kathmandu Valley's micro-bus and tempo network is one of the <strong>most used yet least documented</strong> transport systems in Nepal. We're changing that — one crowdsourced stop at a time.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-emerald-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="#portals" className="bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition shadow-lg">
              Explore the Platform →
            </Link>
            <Link href="/live-tracking" className="flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              View Live Map
            </Link>
          </div>
        </div>
      </section>

      {/* ── Problem Statement ─────────────────────────────────── */}
      <section className="bg-amber-50 border-y border-amber-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4 items-start">
          <span className="text-3xl flex-shrink-0">⚠️</span>
          <div>
            <h2 className="font-bold text-amber-900 text-lg mb-1">The Problem</h2>
            <p className="text-amber-800 text-sm leading-relaxed">
              No reliable digital map of micro-bus & tempo routes, stops, or fares exists for commuters or newcomers in Kathmandu Valley.
              Routes are known only to long-time residents. Newcomers and tourists face significant barriers — no apps, no timetable, no fare guides.
              <strong> Our platform solves this through community-driven data collection, validation, and a smart route planner.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Route Search ─────────────────────────────────────── */}
      <section id="search" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border-2 border-emerald-100 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🔍 Find Your Route</h2>
            <p className="text-gray-500 text-sm">Enter your start and destination — we'll find the right micro-bus or tempo route with fare & stop info.</p>
          </div>
          <SearchForm />
        </div>
      </section>

      {/* ── Three Portals ────────────────────────────────────── */}
      <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Three Distinct Portals</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            The platform is built for three user groups — each with their own dedicated experience for collecting, validating, and using transit data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {portals.map((p) => {
            const c = colorMap[p.color];
            return (
              <div key={p.title} className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6 flex flex-col`}>
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-3xl w-14 h-14 rounded-2xl flex items-center justify-center ${c.icon}`}>
                    {p.icon}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                    {p.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>

                {/* Feature bullets */}
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.bullet}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={p.href}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition ${c.cta}`}
                >
                  {p.cta} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '✏️', title: 'Contribute', desc: 'Drivers & commuters submit route details, stops, and fares via the Contributor Portal.' },
              { step: '02', icon: '🛡️', title: 'Validate', desc: 'Transport authority admins review and approve submissions, ensuring accuracy before publishing.' },
              { step: '03', icon: '🗄️', title: 'Publish', desc: 'Verified routes and fares are added to the live database accessible to all commuters.' },
              { step: '04', icon: '🗺️', title: 'Navigate', desc: 'Commuters search start → destination and get route, fare estimate, and nearest stop instantly.' },
            ].map((item) => (
              <div key={item.step} className="relative bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <span className="absolute top-4 right-4 text-emerald-200 font-black text-3xl leading-none">{item.step}</span>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Tracking CTA ────────────────────────────────── */}
      <section className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">🚌 Real-Time Vehicle Tracking</h2>
          <p className="text-emerald-100 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Beyond route planning — see live vehicle positions on the map. Drivers share GPS location, commuters watch in real-time. Uber-style tracking for Kathmandu's public transport.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/live-tracking" className="bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition shadow-lg">
              Open Live Map
            </Link>
            <Link href="/driver/live" className="flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Go Live as Driver
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-xs">
        <p>🏆 Built for Hackathon · Kathmandu Valley Crowdsourced Transport Mapper</p>
        <p className="mt-1">Micro-bus & Tempo network · Kathmandu · Lalitpur · Bhaktapur</p>
      </footer>
    </div>
  );
}
