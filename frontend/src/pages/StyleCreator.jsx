import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import axios from 'axios';
import { Wand2, Sparkles, X, RotateCw, FlaskConical, PencilRuler } from 'lucide-react';
import ClothingCard from '../components/ClothingCard'; // Importujemy Twoją kartę!

export default function StyleCreator() {
  const [occasion, setOccasion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null); 
  
  // Stan na wszystkie ubrania użytkownika
  const [clothes, setClothes] = useState([]);

  const abortControllerRef = useRef(null);
  const popularOccasions = ['Wesele', 'Praca w biurze', 'Randka', 'Spacer', 'Wyjście ze znajomymi'];

  // Pobieramy szafę w tle, żeby mieć obrazki i opisy do wyświetlenia
  useEffect(() => {
    api.get('clothes/')
      .then(response => setClothes(response.data))
      .catch(err => console.error("Błąd pobierania szafy:", err));
  }, []);

  const handleGenerate = async (e, specificOccasion = occasion) => {
    e?.preventDefault();
    if (!specificOccasion.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await api.post(
        'clothes/suggest/', 
        { occasion: specificOccasion.trim() },
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

  // SYMULACJA AI (Awaryjny generator do testów UI)
  const handleMockGenerate = (e) => {
    e?.preventDefault();
    if (clothes.length === 0) {
      setError('Masz pustą szafę! Dodaj najpierw jakieś ubrania.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    // Udajemy, że AI myśli przez 1.5 sekundy
    setTimeout(() => {
      // Tasujemy szafę i wybieramy od 2 do 3 elementów
      const shuffled = [...clothes].sort(() => 0.5 - Math.random());
      const maxItems = Math.min(3, shuffled.length);
      const selectedIds = shuffled.slice(0, maxItems).map(c => c.id);

      setGeneratedData({
        occasion: occasion || 'Testowa Okazja',
        suggested_outfit_ids: selectedIds,
        message: 'Oto zestaw wygenerowany przez Mock AI!'
      });
      setIsGenerating(false);
    }, 1500);
  };

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

  // WIDOK REZULTATU (ETAP 3: Piękna kompozycja)
  if (generatedData) {
    // Mapujemy ID z API na pełne obiekty ubrań z naszej bazy
    const outfitClothes = clothes.filter(c => generatedData.suggested_outfit_ids.includes(c.id));

    return (
      <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Propozycja Stylizacji
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Okazja: <strong className="text-slate-700 capitalize">{generatedData.occasion}</strong>
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* Przycisk regeneracji */}
            <button 
              onClick={(e) => handleMockGenerate(e)} // UŻYWAMY MOCKA DO TESTÓW (Zmień na handleGenerate jak API ożyje)
              className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCw className="w-4 h-4" /> Inna opcja
            </button>
            <button 
              onClick={() => setGeneratedData(null)}
              className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              Nowa okazja
            </button>
          </div>
        </div>

        {outfitClothes.length === 0 ? (
          <div className="bg-orange-50 text-orange-700 p-6 rounded-2xl border border-orange-200 text-center">
            AI nie potrafiło dopasować ubrań do tej okazji. Spróbuj dodać więcej rzeczy do szafy!
          </div>
        ) : (
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {outfitClothes.map(item => (
                <div key={item.id} className="relative group">
                  <ClothingCard item={item} onClick={() => console.log('Edytuj to ubranie:', item.id)} />
                  
                  {/* Etap 4 (Zajawka): Przycisk do ręcznej podmiany elementu */}
                  <button 
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-blue-600 hover:border-blue-300 transition-all"
                    title="Podmień element"
                  >
                    <PencilRuler className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-purple-600 bg-purple-50 inline-block px-4 py-2 rounded-full border border-purple-100">
                {generatedData.message || "Ten zestaw świetnie sprawdzi się na Twoje wyjście!"}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // WIDOK STARTOWY (Wybór okazji)
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
            
            {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

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

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {/* Główny przycisk do prawdziwego API */}
              <button
                type="submit"
                disabled={!occasion.trim() || clothes.length === 0}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-2"
              >
                <Wand2 className="w-5 h-5" /> Wygeneruj
              </button>
              
              {/* Przycisk MOCK API do testowania bez limitów */}
              <button
                type="button"
                onClick={handleMockGenerate}
                disabled={clothes.length === 0}
                className="sm:w-1/3 py-4 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                title="Losuje ubrania z bazy, omijając prawdziwe API (Przydatne przy limitach)"
              >
                <FlaskConical className="w-4 h-4" /> Udawaj AI
              </button>
            </div>
            {clothes.length === 0 && (
              <p className="text-xs text-orange-500 mt-2 font-medium">Musisz mieć ubrania w szafie, aby użyć kreatora.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}