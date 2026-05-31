
import { useState } from 'react';
import { X } from 'lucide-react';

export default function AccountSettingsModal({ type, onClose, onSubmit }) {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  const handleSubmit = () => {
    if (type === 'password') {
      onSubmit(value1, value2);
    } else {
      onSubmit(value1);
    }
    onClose();
  };

  const titleMap = {
    username: 'Zmień nazwę użytkownika',
    email: 'Zmień adres e-mail',
    password: 'Zmień hasło',
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{titleMap[type]}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {type === 'password' ? (
            <>
              <input
                type="password"
                placeholder="Stare hasło"
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
              />
              <input
                type="password"
                placeholder="Nowe hasło"
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
              />
            </>
          ) : (
            <input
              type="text"
              placeholder={type === 'email' ? 'Nowy email' : 'Nowa nazwa'}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 rounded-lg"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Zapisz
          </button>
        </div>

      </div>
    </div>
  );
}
