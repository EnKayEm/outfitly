import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // walidacja
    if (!username || !email || !password || !repeatPassword) {
      setError('Uzupełnij wszystkie pola');
      return;
    }

    if (password !== repeatPassword) {
      setError('Hasła nie są takie same');
      return;
    }

    try {
      setLoading(true);

      await api.post('auth/register/', {
        login: username,
        email: email,
        password: password,
      });

      // po rejestracji przekierowanie do logowania
      navigate('/login');
    } catch (err) {
      // obsługa błędów backendu
      if (err.response?.data?.login) {
        setError('Nazwa użytkownika już istnieje');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Błąd rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Rejestracja</h1>
        <p className="text-slate-500 mb-6">Załóż konto w Outfitly</p>

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nazwa użytkownika
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Powtórz hasło
            </label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 flex justify-center items-center"
            >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
            </button>
        </form>
      </div>
    </div>
  );
}
