
import { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Podaj adres email');
      return;
    }

    try {
      setLoading(true);

      await api.post('auth/reset-password/', {
        email: email,
      });

      setMessage('Jeśli konto istnieje, wysłano link resetujący');
    } catch {
      setMessage('Błąd wysyłania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Reset hasła</h1>
        <p className="text-slate-500 mb-6">Odzyskaj dostęp do konta</p>

        <form onSubmit={handleReset} className="space-y-4 text-left">
          {message && (
            <div className="text-sm bg-slate-100 p-2 rounded">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? 'Wysyłanie...' : 'Resetuj hasło'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600">
          Pamiętasz hasło?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Wróć do logowania
          </span>
        </div>
      </div>
    </div>
  );
}
