import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { ArrowLeft, User, Mail, Lock, Save, Loader2 } from 'lucide-react';
import { isAuthenticated } from '../api/auth';
import toast from 'react-hot-toast';

export default function Settings() {
  const [username, setUsername] = useState('Użytkownik');
  const [currentEmail, setCurrentEmail] = useState('');

  // Wartości formularzy
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Stany ładowania dla poszczególnych sekcji
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) setCurrentEmail(storedEmail);

    // Dociągamy aktualne dane konta (e-maila nie ma w tokenie JWT)
    if (isAuthenticated()) {
      api.get('auth/me/')
        .then((res) => {
          if (res.data?.login) {
            setUsername(res.data.login);
            localStorage.setItem('username', res.data.login);
          }
          if (res.data?.email) {
            setCurrentEmail(res.data.email);
            localStorage.setItem('email', res.data.email);
          }
        })
        .catch(() => { /* nie udało się pobrać danych konta — pomijamy */ });
    }
  }, []);

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error('Podaj nową nazwę użytkownika');
      return;
    }
    try {
      setSavingUsername(true);
      await api.patch('auth/change-username/', { login: newUsername });
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
      setNewUsername('');
      window.dispatchEvent(new Event('user-updated'));
      toast.success('Nazwa użytkownika została zmieniona');
    } catch (err) {
      console.error(err);
      toast.error('Błąd przy zmianie nazwy');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('Podaj nowy adres e-mail');
      return;
    }
    try {
      setSavingEmail(true);
      await api.patch('auth/change-email/', { email: newEmail });
      localStorage.setItem('email', newEmail);
      setCurrentEmail(newEmail);
      setNewEmail('');
      window.dispatchEvent(new Event('user-updated'));
      toast.success('Adres e-mail został zmieniony');
    } catch (err) {
      console.error(err);
      toast.error('Błąd przy zmianie adresu e-mail');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Uzupełnij pola hasła');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Nowe hasła nie są takie same');
      return;
    }
    try {
      setSavingPassword(true);
      await api.patch('auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Hasło zostało zmienione');
    } catch (err) {
      console.error(err);
      toast.error('Błąd przy zmianie hasła');
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition';

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-3xl w-full mx-auto">

      {/* Powrót na stronę główną */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Powrót do strony głównej
      </Link>

      {/* Karta profilu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold uppercase shrink-0">
          {username.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ustawienia konta</h1>
          <p className="text-slate-500 mt-0.5">
            Zalogowano jako <span className="font-medium text-slate-700">{username}</span>
          </p>
        </div>
      </div>

      {/* Zmiana nazwy użytkownika */}
      <form
        onSubmit={handleChangeUsername}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Nazwa użytkownika</h2>
            <p className="text-sm text-slate-500">Zmień nazwę widoczną w Twoim koncie.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-username" className="block text-xs font-medium text-slate-500 mb-1.5">
              Nowa nazwa użytkownika
            </label>
            <input
              id="new-username"
              type="text"
              placeholder={username}
              className={inputClass}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={savingUsername}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {savingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz
          </button>
        </div>
      </form>

      {/* Zmiana adresu e-mail */}
      <form
        onSubmit={handleChangeEmail}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Adres e-mail</h2>
            <p className="text-sm text-slate-500">Adres używany do logowania i powiadomień.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-email" className="block text-xs font-medium text-slate-500 mb-1.5">
              Nowy adres e-mail
            </label>
            <input
              id="new-email"
              type="email"
              placeholder={currentEmail || 'nowy@email.pl'}
              className={inputClass}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={savingEmail}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz
          </button>
        </div>
      </form>

      {/* Zmiana hasła */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Hasło</h2>
            <p className="text-sm text-slate-500">Zadbaj o bezpieczeństwo swojego konta.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="old-password" className="block text-xs font-medium text-slate-500 mb-1.5">
              Obecne hasło
            </label>
            <input
              id="old-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputClass}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-password" className="block text-xs font-medium text-slate-500 mb-1.5">
                Nowe hasło
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-medium text-slate-500 mb-1.5">
                Powtórz nowe hasło
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zmień hasło
          </button>
        </div>
      </form>

    </div>
  );
}
