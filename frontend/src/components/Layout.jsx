import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Shirt, Sparkles, LayoutGrid, LogOut, ChevronDown, Settings, Phone, Menu, X } from 'lucide-react';
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
  const [username, setUsername] = useState('Użytkownik');
  const [email, setEmail] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    const syncFromStorage = () => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) setUsername(storedUsername);
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) setEmail(storedEmail);
    };
    syncFromStorage();
    window.addEventListener('user-updated', syncFromStorage);

    // E-maila nie ma w tokenie JWT — dociągamy aktualne dane konta z API
    if (isAuthenticated()) {
      api.get('auth/me/')
        .then((res) => {
          if (res.data?.login) {
            setUsername(res.data.login);
            localStorage.setItem('username', res.data.login);
          }
          if (res.data?.email) {
            setEmail(res.data.email);
            localStorage.setItem('email', res.data.email);
          }
        })
        .catch(() => { /* nie udało się pobrać danych konta — pomijamy */ });
    }

    return () => window.removeEventListener('user-updated', syncFromStorage);
  }, []);

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
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium"
      >
        Przejdź do głównej treści
      </a>

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
              <Shirt aria-hidden="true" className="w-7 h-7 text-blue-600" strokeWidth={2.5} /> Outfitly
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
                  <Icon aria-hidden="true" className="w-4 h-4" /> {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            
            {isAuthenticated() ? (
              <>
                {/* User menu dla zalogowanych */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors hover:bg-slate-100 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                      {username.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">
                      {username}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 min-w-[11rem] max-w-[16rem] w-max bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Nagłówek: avatar + nazwa + e-mail */}
                      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">
                          {username.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{username}</p>
                          {email && <p className="text-xs text-slate-400 truncate">{email}</p>}
                        </div>
                      </div>

                      <div className="py-1.5">
                        <button
                          onClick={() => { setIsUserMenuOpen(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                          <span className="text-sm whitespace-nowrap">Ustawienia</span>
                        </button>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span className="text-sm whitespace-nowrap">Wyloguj</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Przyciski dla NIEzalogowanych */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Zaloguj się
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Rejestracja
                </Link>
              </div>
            )}

            {/* Hamburger — tylko na mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ml-1"
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
                  <Icon aria-hidden="true" className="w-4 h-4" /> {label}
                </NavLink>
              ))}
              {!isAuthenticated() && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-center rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Zaloguj się
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <Link
            to="/deklaracja-dostepnosci"
            className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
          >
            Deklaracja dostępności
          </Link>
        </div>
      </footer>

    </div>
  );
}
