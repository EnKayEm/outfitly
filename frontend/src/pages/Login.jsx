import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Uzupełnij wszystkie pola');
      return;
    }

    try {
      setLoading(true); // start loading

      const response = await api.post('auth/login/', {
        username: username,
        password: password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      navigate('/dashboard');
    } catch (err) {
      // lepsza obsługa błędów backendu
      if (err.response?.status === 401) {
        setError('Niepoprawny login lub hasło');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Błąd serwera. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false); // stop loading
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Logowanie</h1>
        <p className="text-slate-500 mb-6">Witaj w Outfitly!</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {error && <div role="alert" className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-slate-700">Nazwa użytkownika</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Hasło</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/my-outfits')}
            className="w-full mt-2 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition"
          >
            Wypróbuj demo
          </button>

        </form>
        <div className="flex justify-between text-sm mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline transition"
            onClick={() => navigate('/register')}
          >
            Rejestracja
          </button>

          <button
            type="button"
            className="text-blue-600 hover:underline transition"
            onClick={() => navigate('/reset-password')}
          >
            Zapomniałeś hasła?
          </button>
        </div>
      </div>
    </div>
  );
}