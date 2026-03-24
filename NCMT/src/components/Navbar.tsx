import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-emerald-800">Transit Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-700 hover:text-emerald-700 transition">
              Home
            </Link>
            <Link href="/driver" className="text-gray-700 hover:text-emerald-700 transition">
              Driver
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-emerald-700 transition">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
