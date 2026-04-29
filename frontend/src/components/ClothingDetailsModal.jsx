import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function ClothingDetailsModal({ isOpen, onClose, clothingId }) {
  const [clothing, setClothing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobieranie szczegółów ubrania za każdym razem, gdy otwiera się modal dla danego ID
  useEffect(() => {
    if (!isOpen || !clothingId) return;

    const fetchClothingDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`clothes/${clothingId}/`);
        setClothing(response.data);
      } catch (err) {
        setError('Nie udało się pobrać szczegółów ubrania.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClothingDetails();

    // Czyszczenie stanu przy zamknięciu, żeby stare dane nie mignęły przy kolejnym otwarciu
    return () => setClothing(null);
  }, [isOpen, clothingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Nagłówek */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Szczegóły ubrania</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        {/* Ciało Modala */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="animate-pulse flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-square bg-slate-200 rounded-2xl"></div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
                <div className="h-8 bg-slate-200 rounded-md w-1/2 mt-4"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
          ) : clothing ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Zdjęcie */}
              <div className="w-full md:w-1/2">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  {clothing.image_url ? (
                    <img src={clothing.image_url} alt="Ubranie" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>
                  )}
                </div>
              </div>
              
              {/* Informacje */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Opis</p>
                  <h3 className="text-xl font-semibold text-slate-800">{clothing.description || 'Brak opisu'}</h3>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kolor</p>
                  <p className="text-slate-700 font-medium capitalize">{clothing.color || 'Brak koloru'}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategorie</p>
                  <div className="flex flex-wrap gap-2">
                    {clothing.categories && clothing.categories.length > 0 ? (
                      clothing.categories.map((cat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">Brak przypisanych kategorii</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}