import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Górny pasek nawigacji */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-extrabold text-blue-600">
            👗 Outfitly
          </Link>
          <button className="text-sm font-medium text-slate-600 hover:text-red-500 transition">
            Wyloguj
          </button>
        </div>
      </header>

      {/* Dynamiczna treść strony */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}