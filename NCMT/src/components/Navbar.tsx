'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-auto sm:py-4">
          <Link href="/" className="flex items-center flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-emerald-800">🚍 Transit</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            >
              Home
            </Link>
            <Link
              href="/driver"
              className="px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            >
              Driver
            </Link>
            <Link
              href="/admin"
              className="px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            >
              Admin
            </Link>
            <Link
              href="/live-tracking"
              className="px-3 py-2 text-sm sm:text-base font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              Live
            </Link>
            <Link
              href="/driver/live"
              className="flex items-center gap-1.5 px-3 py-2 text-sm sm:text-base font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg transition shadow-sm"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Driver Live
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/driver"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Driver Portal
            </Link>
            <Link
              href="/admin"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
            <Link
              href="/live-tracking"
              className="block px-4 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Live Tracking
            </Link>
            <Link
              href="/driver/live"
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Driver Live
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
