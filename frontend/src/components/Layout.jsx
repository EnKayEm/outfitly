import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Shirt, Sparkles, LayoutGrid, LogOut, ChevronDown, User, Mail, Lock, Phone, Menu, X } from 'lucide-react';
import { isAuthenticated } from '../api/auth';

const navLinks = [
  { to: '/dashboard',     label: 'Twoja Szafa',       Icon: LayoutGrid, activeClass: 'bg-blue-50 text-blue-700' },
  { to: '/style-creator', label: 'Kreator Stylizacji', Icon: Sparkles,   activeClass: 'bg-purple-50 text-purple-700' },
  { to: '/my-outfits',    label: 'Moje stylizacje',    Icon: Shirt,      activeClass: 'bg-blue-50 text-blue-700' },
  { to: '/contact',       label: 'Kontakt',            Icon: Phone,      activeClass: 'bg-blue-50 text-blue-700' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('auth/logout/', { refresh: refreshToken });
      }
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

      {/* TRYB DEMO */}
      {!isAuthenticated() && (
        <div className="bg-yellow-50 text-yellow-700 text-center text-sm py-2 border-b flex justify-center items-center gap-2">
          <span>Korzystasz z trybu demo —</span>
          <button
            onClick={() => navigate('/login')}
            className="font-semibold underline hover:text-yellow-900 transition"
          >
            zaloguj się,
          </button>
          <span> aby zapisywać dane</span>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              <Shirt className="w-7 h-7 text-blue-600" strokeWidth={2.5} /> Outfitly
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex gap-2">
              {navLinks.map(({ to, label, Icon, activeClass }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive ? activeClass : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" /> {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => isAuthenticated() && setIsUserMenuOpen(prev => !prev)}
                className={`flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors ${
                  isAuthenticated() ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  S
                </div>
                {isAuthenticated() ? (
                  <>
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">Superuser</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </>
                ) : (
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Niezalogowany
                  </span>
                )}
              </button>

              {isAuthenticated() && isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-800">Ustawienia konta</p>
                    <p className="text-xs text-slate-400 mt-0.5">Superuser</p>
                  </div>
                  <div className="py-2">
                    {[
                      { Icon: User, label: 'Zmień nazwę użytkownika' },
                      { Icon: Mail, label: 'Zmień adres e-mail' },
                      { Icon: Lock, label: 'Zmień hasło' },
                    ].map(({ Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-400 cursor-not-allowed select-none"
                        title="Funkcja niedostępna — backend nie obsługuje jeszcze tej operacji"
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm">{label}</span>
                        <span className="ml-auto text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          Wkrótce
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            {isAuthenticated() && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
                title="Wyloguj się"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            )}

            {/* Hamburger — tylko na mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Menu nawigacyjne"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ to, label, Icon, activeClass }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      isActive ? activeClass : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" /> {label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
