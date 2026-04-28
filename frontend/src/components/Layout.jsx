import { Outlet, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

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
      <header className="bg-white shadow-sm border-b border-slate-200 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-extrabold text-blue-600 flex items-center gap-2">
            <span>👗</span> Outfitly
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">Zalogowano jako: Superuser</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow-sm"
            >
              Wyloguj się
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