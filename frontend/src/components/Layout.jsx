import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Shirt, Sparkles, LayoutGrid, LogOut } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('auth/logout/', { refresh: refreshToken });
    } catch (err) {
      console.error("Błąd podczas informowania backendu o wylogowaniu", err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Przyklejony nagłówek z efektem szkła  */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shirt className="w-7 h-7 text-blue-600" strokeWidth={2.5} /> Outfitly
            </Link>
            
            <nav className="flex gap-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Twoja Szafa
              </NavLink>
              <NavLink 
                to="/style-creator" 
                className={({ isActive }) => `px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isActive ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Kreator Stylizacji
              </NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Pastylka użytkownika */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                S
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block pr-1">Superuser</span>
            </div>

            {/* Subtelny przycisk wylogowania z ikoną */}
            <button 
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Wyloguj</span>
            </button>
          </div>

        </div>
      </header>

      {/* Główna treść aplikacji */}
      <main className="flex-grow max-w-7xl w-auto mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}