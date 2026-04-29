import { useState, useRef } from 'react';
import { Wand2, Sparkles, X } from 'lucide-react';
import api from '../api/axiosConfig';
import axios from 'axios';

export default function StyleCreator() {
  const [occasion, setOccasion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null); 

  // Referencja do kontrolera, żebyśmy mogli go odpalić z innego miejsca (przycisku Anuluj)
  const abortControllerRef = useRef(null);

  const popularOccasions = ['Wesele', 'Praca w biurze', 'Randka', 'Spacer', 'Wyjście ze znajomymi'];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!occasion.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await api.post(
        'clothes/suggest/', 
        { occasion: occasion.trim() },
        { signal: abortControllerRef.current.signal }
      );
      setGeneratedData(response.data);
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        console.log('Zapytanie przerwane przez użytkownika.');
      } else {
        setError('Błąd komunikacji z AI. Twój stylista poszedł na kawę. Spróbuj ponownie.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Funkcja odpalana przyciskiem "Anuluj"
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  // EKRAN ŁADOWANIA
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Twój prywatny stylista dobiera ubrania...</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Analizuję Twoją szafę, sprawdzam trendy i dopasowuję kolory na okazję: <strong className="text-purple-600">{occasion}</strong>.
        </p>
        
        <button 
          onClick={handleCancel}
          className="px-6 py-2 border-2 border-red-200 text-red-500 font-medium rounded-full hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" /> Przerwij wyszukiwanie
        </button>
      </div>
    );
  }

  // WIDOK REZULTATU
  if (generatedData) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Stylizacja znaleziona! 🎉</h2>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 font-mono text-sm overflow-auto">
          {JSON.stringify(generatedData, null, 2)}
        </div>
        <button 
          onClick={() => setGeneratedData(null)}
          className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
        >
          Wróć do kreatora
        </button>
      </div>
    );
  }

  // WIDOK STARTOWY 
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          <Wand2 className="w-16 h-16 mx-auto mb-4 text-purple-600" strokeWidth={1.5} />
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Kreator Stylizacji</h1>
          <p className="text-slate-500 mb-8">Napisz, gdzie się wybierasz, a AI dobierze idealny zestaw z Twojej szafy.</p>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="np. Wesele kuzyna, Rozmowa o pracę..."
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all shadow-inner"
              required
            />
            
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <span className="text-sm text-slate-400 py-1 mr-2">Podpowiedzi:</span>
              {popularOccasions.map(occ => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-xs font-medium hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                >
                  {occ}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!occasion.trim()}
              className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-2"
            >
              <Wand2 className="w-5 h-5" /> Wygeneruj stylizację
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}