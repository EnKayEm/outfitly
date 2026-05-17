
import { useState } from 'react';
import api from '../api/axiosConfig';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
            className="w-full bg-yellow-500 text-white py-2 rounded-lg disabled:bg-yellow-300"
          >
            {loading ? 'Wysyłanie...' : 'Resetuj hasło'}
          </button>
        </form>
      </div>
    </div>
  );
}
