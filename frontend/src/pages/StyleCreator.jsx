import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import axios from 'axios';
import { Wand2, Sparkles, X, RotateCw, PencilRuler, Trash2, Save, Plus, Heart, PenLine } from 'lucide-react';
import ClothingCard from '../components/ClothingCard';
import SwapClothingModal from '../components/SwapClothingModal';
import { isAuthenticated } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { demoClothes } from '../data/demoData';

export default function StyleCreator() {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const navigate = useNavigate();
  const [occasion, setOccasion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null); 
  const [clothes, setClothes] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [itemToSwap, setItemToSwap] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const abortControllerRef = useRef(null);
  const popularOccasions = ['Wesele', 'Praca w biurze', 'Randka', 'Spacer', 'Wyjście ze znajomymi'];

  useEffect(() => {
    if (!isAuthenticated()) {
      setClothes(demoClothes);
      return;
    }

    api.get('clothes/')
      .then(response => setClothes(response.data))
      .catch(err => console.error("Błąd pobierania szafy:", err));
  }, []);

  const handleGenerate = async (e, specificOccasion = occasion) => {
    e?.preventDefault();

    if (!specificOccasion.trim()) {
        setError("Podaj okazję");
        return;
      }
    
    if (!isAuthenticated()) {
      setShowGuestModal(true);
      return;
    }

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

  const handleCancel = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsGenerating(false);
  };

  // --- FUNKCJE OBSŁUGUJĄCE PODMIANĘ (SWAP) ---
  const openSwapModal = (itemId) => {
    setItemToSwap(itemId);
    setIsSwapModalOpen(true);
  };

  const handleExecuteSwap = (newItemId) => {
    setGeneratedData(prevData => {
      const safeIds = Array.isArray(prevData?.suggested_outfit_ids) ? prevData.suggested_outfit_ids : [];
      return {
        ...prevData,
        suggested_outfit_ids: safeIds.map(id => String(id) === String(itemToSwap) ? newItemId : id)
      };
    });
    
    setIsSwapModalOpen(false);
    setItemToSwap(null);
  };

  const handleExecuteAdd = (newItemId) => {
    setGeneratedData(prevData => {
      const safeIds = Array.isArray(prevData?.suggested_outfit_ids) ? prevData.suggested_outfit_ids : [];
      
      if (safeIds.some(id => String(id) === String(newItemId))) return prevData;
      
      return {
        ...prevData,
        suggested_outfit_ids: [...safeIds, newItemId]
      };
    });
    
    setIsAddModalOpen(false);
  };

  const handleRemoveItem = (itemIdToRemove) => {
    setGeneratedData(prevData => {
      const safeIds = Array.isArray(prevData?.suggested_outfit_ids) ? prevData.suggested_outfit_ids : [];
      return {
        ...prevData,
        suggested_outfit_ids: safeIds.filter(id => String(id) !== String(itemIdToRemove))
      };
    });
  };
  
  const toggleFavorite = () => {
    if (!isAuthenticated()) { setShowGuestModal(true); return; }
    setIsFavorite(prev => !prev);
  };

  const handleManualCreate = () => {
    if (!isAuthenticated()) { setShowGuestModal(true); return; }
    if (!occasion.trim()) { setError('Podaj okazję przed stworzeniem stylizacji'); return; }
    setError(null);
    setGeneratedData({
      suggested_outfit_ids: [],
      occasion: occasion.trim(),
      message: 'Twoja ręcznie skomponowana stylizacja.',
      manual: true,
    });
  };

  const handleSaveOutfit = async () => {
    if (!isAuthenticated()) {
      setShowGuestModal(true);
      return;
    }

    if (!generatedData || !generatedData.suggested_outfit_ids || generatedData.suggested_outfit_ids.length === 0) {
      setError("Nie można zapisać pustego zestawu.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.post('clothes/suggest/confirm/', {
        outfit_ids: generatedData.suggested_outfit_ids,
        occasion: generatedData.occasion 
      });
      
      const compositionId = res.data.id;

      if (isFavorite) {
        await api.patch(`compositions/${compositionId}/favourite/`);
}
      
      setSuccessMessage('Stylizacja zapisana! Wracamy do menu...');
      
      setTimeout(() => {
        setGeneratedData(null);
        setSuccessMessage(null);
        setOccasion('');
        setIsFavorite(false);
      }, 1500);

    } catch (err) {
      console.error("Błąd podczas zapisywania stylizacji:", err);
      setError('Nie udało się zapisać stylizacji. Twój backend znowu coś popsuł.');
    } finally {
      setIsSaving(false);
    }
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
        
        <button onClick={handleCancel} className="px-6 py-2 border-2 border-red-200 text-red-500 font-medium rounded-full hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2">
          <X className="w-4 h-4" /> Przerwij wyszukiwanie
        </button>
        
        {showGuestModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-[400px] p-6 text-center">

              <button
                onClick={() => setShowGuestModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Funkcja dostępna po zalogowaniu
              </h2>

              <p className="text-slate-500 mb-6">
                Jesteś w trybie demo. Zaloguj się, aby korzystać z tej funkcji.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Zostań w demo
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Zaloguj się
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

// WIDOK REZULTATU
  if (generatedData) {
    const outfitIds = Array.isArray(generatedData.suggested_outfit_ids) 
      ? generatedData.suggested_outfit_ids 
      : [];
      
    const outfitClothes = clothes.filter(c => c?.id && outfitIds.some(id => String(id) === String(c.id)));

    return (
      <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              {generatedData.manual
                ? <PenLine className="w-8 h-8 text-blue-600" />
                : <Sparkles className="w-8 h-8 text-purple-600" />}
              {generatedData.manual ? 'Ręczna Stylizacja' : 'Propozycja Stylizacji'}
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Okazja: <strong className="text-slate-700 capitalize">{generatedData.occasion}</strong>
            </p>
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
            {successMessage && (
              <p className="inline-block mt-3 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold shadow-sm animate-in fade-in zoom-in duration-300">
                {successMessage}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            <button onClick={() => {
                setGeneratedData(null);
                setSuccessMessage(null);
                setIsFavorite(false);
            }} disabled={isSaving} className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center disabled:opacity-50">
              Zmień okazję
            </button>

            <button onClick={(e) => { setSuccessMessage(null); setIsFavorite(false); handleGenerate(e); }} disabled={isSaving} className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              <RotateCw className="w-4 h-4" />
              {generatedData.manual ? 'Wygeneruj z AI' : 'Wygeneruj inny zestaw'}
            </button>

            <button
              onClick={toggleFavorite}
              disabled={isSaving}
              title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center disabled:opacity-50 ${
                isFavorite
                  ? 'bg-pink-50 border-pink-300 text-pink-500 hover:bg-pink-100'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-pink-400 hover:border-pink-200'
              }`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleSaveOutfit}
              disabled={isSaving || outfitClothes.length === 0 || successMessage !== null}
              className="flex-1 md:flex-none px-5 py-2.5 text-white rounded-xl font-bold shadow-md shadow-purple-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Zapisywanie...' : (successMessage ? 'Zapisano!' : 'Zapisz do kolekcji')}
            </button>
          </div>
        </div>

        {outfitClothes.length === 0 ? (
          <div className="bg-orange-50 p-8 rounded-3xl border border-orange-200 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-orange-700 font-medium">Ten zestaw jest pusty. Możesz wygenerować nową propozycję lub zacząć dodawać ubrania ręcznie.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Dodaj pierwszy element
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              {outfitClothes.map(item => (
                <ClothingCard key={item.id} item={item} onClick={() => console.log('Kliknięto podgląd ubrania')}>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated()) {
                        setShowGuestModal(true);
                        return;
                      }
                      handleRemoveItem(item.id);
                    }}
                    className="group/btn-rm absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:border-red-300 transition-all z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover/btn-rm:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:right-full after:border-4 after:border-transparent after:border-r-slate-800">
                      Usuń z zestawu
                    </span>
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated()) {
                        setShowGuestModal(true);
                        return;
                      }
                      openSwapModal(item.id);
                    }}
                    className="group/btn absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-purple-600 hover:border-purple-300 transition-all z-10"
                  >
                    <PencilRuler className="w-4 h-4" />
                    <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:border-4 after:border-transparent after:border-l-slate-800">
                      Podmień element
                    </span>
                  </button>

                  

                </ClothingCard>
              ))}

              <div
                role="button"
                tabIndex={0}
                aria-label="Dodaj ubranie do stylizacji"
                onClick={() => {
                  if (!isAuthenticated()) {
                    setShowGuestModal(true);
                    return;
                  }
                  setIsAddModalOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!isAuthenticated()) { setShowGuestModal(true); return; }
                    setIsAddModalOpen(true);
                  }
                }}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-6 cursor-pointer hover:bg-slate-50 hover:border-purple-400 transition-all min-h-[250px] group"
              >
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-purple-100 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <Plus className="w-8 h-8 text-slate-400 group-hover:text-purple-600" />
                </div>
                <span className="font-medium text-slate-500 group-hover:text-purple-700">Dodaj element</span>
              </div>

            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-purple-600 bg-purple-50 inline-block px-4 py-2 rounded-full border border-purple-100">
                {generatedData.message || "Ten zestaw świetnie sprawdzi się na Twoje wyjście!"}
              </p>
            </div>   
          </div> 
        )}
        
        <SwapClothingModal 
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          clothes={clothes}
          currentOutfitIds={outfitIds} 
          onSwap={handleExecuteSwap}
          mode="swap"
        />

        <SwapClothingModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          clothes={clothes}
          currentOutfitIds={outfitIds}
          onSwap={handleExecuteAdd}
          mode="add"
        /> 

        {showGuestModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-[400px] p-6 text-center">

              <button
                onClick={() => setShowGuestModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Funkcja dostępna po zalogowaniu
              </h2>

              <p className="text-slate-500 mb-6">
                Jesteś w trybie demo. Zaloguj się, aby korzystać z tej funkcji.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Zostań w demo
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Zaloguj się
                </button>
              </div>
            </div>
          </div>
        )}
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

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={!occasion.trim() || clothes.length === 0}
                className="group relative w-full py-4 overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-[0_4px_20px_rgba(147,51,234,0.35)] hover:shadow-[0_6px_35px_rgba(147,51,234,0.55)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <Wand2 className="w-5 h-5 relative" /> <span className="relative">Wygeneruj z AI</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">lub</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleManualCreate}
                disabled={!occasion.trim() || clothes.length === 0}
                className="w-full py-3 border-2 border-blue-600 text-blue-600 bg-white text-base font-semibold rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                <PenLine className="w-4 h-4" /> Stwórz ręcznie
              </button>
            </div>
            {clothes.length === 0 && (
              <p className="text-xs text-orange-500 mt-2 font-medium">Musisz mieć ubrania w szafie, aby użyć kreatora.</p>
            )}
          </form>
        </div>
      </div>
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-[400px] p-6 text-center">

            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Funkcja dostępna po zalogowaniu
            </h2>

            <p className="text-slate-500 mb-6">
              Jesteś w trybie demo. Zaloguj się, aby korzystać z tej funkcji.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowGuestModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Zostań w demo
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Zaloguj się
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
