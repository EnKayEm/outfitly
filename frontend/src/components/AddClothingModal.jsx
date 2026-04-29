import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';

//Poprawić dane wprowadzane ręcznie 

export default function AddClothingModal({ isOpen, onClose, onSuccess, availableCategories = [] }) {  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Stany logiki AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  // Stany trybu ręcznego
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState({ description: '', color: '', categories: [] });

  
  const fileInputRef = useRef(null);

  const [customCategory, setCustomCategory] = useState('');
  

  // Czyszczenie URL-a z pamięci przeglądarki, żeby nie robić wycieków pamięci
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Reset stanu po zamknięciu modala
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setIsAnalyzing(false);
      setError(null);
      setIsManualMode(false);
      setManualData({ description: '', color: '', categories: [] });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  // Wysyłka do Gemini
  const handleAIUpload = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file); // Zmień na właściwą nazwę pola, jeśli backend wymaga innej

    try {
      await api.post('clothes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess(); // Odświeża siatkę w Dashboard
      onClose(); // Zamyka modal
    } catch (err) {
      setIsAnalyzing(false);
      if (err.response?.status === 400) {
        setError('AI Bouncer: To nie wygląda jak ubranie. Spróbuj inne zdjęcie lub użyj trybu ręcznego.');
      } else {
        setError('Błąd serwera podczas analizy AI. Spróbuj ponownie.');
      }
    }
  };

  // Wysyłka w trybie ręcznym
  const handleManualUpload = async (e) => {
  e.preventDefault();
  if (!file) return setError('Dodaj zdjęcie!');

  setIsAnalyzing(true);
  setError(null);

  const formData = new FormData();
  formData.append('image', file);
  formData.append('description', manualData.description);
  formData.append('color', manualData.color);
  
  manualData.categories.forEach(cat => formData.append('categories', cat));

  try {
    await api.post('clothes/manual/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    onSuccess();
    onClose();
  } catch (err) {
    setIsAnalyzing(false);
    setError('Nie udało się zapisać ubrania ręcznie. Sprawdź logi serwera.');
  }
};

const toggleCategory = (cat) => {
    setManualData(prev => {
      const isSelected = prev.categories.includes(cat);
      return {
        ...prev,
        categories: isSelected 
          ? prev.categories.filter(c => c !== cat) 
          : [...prev.categories, cat]
      };
    });
  };

  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    const cleanCat = customCategory.trim();
    if (cleanCat && !manualData.categories.includes(cleanCat)) {
      setManualData(prev => ({...prev, categories: [...prev.categories, cleanCat]}));
    }
    setCustomCategory(''); // Czyścimy input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Nagłówek Modala */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isManualMode ? 'Dodaj ubranie ręcznie' : 'Zeskanuj ubranie AI 🤖'}
          </h2>
          <button onClick={onClose} disabled={isAnalyzing} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            ✕
          </button>
        </div>

        {/* Zawartość */}
        <div className="p-4 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Strefa dodawania zdjęcia */}
          <div className="mb-6">
            {!preview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors"
              >
                <div className="text-4xl mb-2">📸</div>
                <p className="text-slate-600 font-medium">Kliknij, aby wybrać zdjęcie</p>
                <p className="text-slate-400 text-sm mt-1">JPG, PNG (max 5MB)</p>
              </div>
            ) : (
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={preview} alt="Podgląd" className="w-full h-full object-cover" />
                
                {/* Animacja skanowania AI */}
                {isAnalyzing && !isManualMode && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center overflow-hidden z-10">
                    {/* Holograficzna siatka w tle */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                    {/* Skanująca linia z gradientowym cieniem */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-blue-500/30 animate-[scan_2s_ease-in-out_infinite] border-b-2 border-blue-400 shadow-[0_5px_15px_rgba(59,130,246,0.6)]"></div>

                    {/* Cyber-celownik */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 border border-blue-500/50 rounded-full animate-ping opacity-20"></div>
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                    </div>

                    <p className="text-blue-400 font-mono text-xs tracking-widest mt-6 drop-shadow-md relative z-10 animate-pulse uppercase">
                      Analiza obrazu...
                    </p>
                  </div>
                )}

                {/* Przycisk usuwania wybranego zdjęcia (ukryty podczas analizy) */}
                {!isAnalyzing && (
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isAnalyzing} />
          </div>

          {/* Formularz ręczny (widoczny tylko w trybie manualnym i gdy jest plik) */}
          {isManualMode && preview && (
            <form id="manual-form" onSubmit={handleManualUpload} className="flex flex-col gap-3">
              <input 
                required 
                type="text" 
                placeholder="Krótki opis (np. Zielona czapka)" 
                className="p-2 border rounded-lg focus:ring-2 outline-none border-slate-200" 
                value={manualData.description} 
                onChange={e => setManualData({...manualData, description: e.target.value})} 
                disabled={isAnalyzing}
              />
              <input 
                required 
                type="text" 
                placeholder="Kolor (np. Zielony)" 
                className="p-2 border rounded-lg focus:ring-2 outline-none border-slate-200" 
                value={manualData.color} 
                onChange={e => setManualData({...manualData, color: e.target.value})} 
                disabled={isAnalyzing}
              />
              {/* Strefa Kategorii */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-sm text-slate-600 font-medium">Kategorie:</span>
                 
                {/* Chmurki z istniejącymi kategoriami do wyklikania */}
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        manualData.categories.includes(cat)
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat} {manualData.categories.includes(cat) ? '✕' : '+'}
                    </button>
                  ))}
                  
                  {/* Ręcznie dodane tagi (te, których nie ma na liście z bazy) */}
                  {manualData.categories.filter(c => !availableCategories.includes(c)).map(cat => (
                    <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-100 border-blue-300 text-blue-700 flex items-center gap-1">
                      {cat} <button type="button" onClick={() => toggleCategory(cat)} className="hover:text-blue-900 font-bold">✕</button>
                    </span>
                  ))}
                </div>

                {/* Input do dodania nowej, nieistniejącej kategorii */}
                <div className="flex gap-2 mt-1">
                  <input 
                    type="text" 
                    placeholder="Własna kategoria..." 
                    className="flex-1 p-2 border rounded-lg focus:ring-2 outline-none border-slate-200 text-sm" 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory(e)}
                    disabled={isAnalyzing}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddCustomCategory}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                    disabled={isAnalyzing || !customCategory.trim()}
                  >
                    Dodaj
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Przyciski akcji */}
          {preview && (
            <div className="flex flex-col gap-2 mt-4">
              {!isManualMode ? (
                <>
                  <button onClick={handleAIUpload} disabled={isAnalyzing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                    {isAnalyzing ? 'Przetwarzanie AI...' : 'Zeskanuj ubranie AI ✨'}
                  </button>
                  <button onClick={() => setIsManualMode(true)} disabled={isAnalyzing} className="w-full text-slate-500 py-2 text-sm hover:text-slate-700">
                    Skanowanie zawiodło? Dodaj ręcznie
                  </button>
                </>
              ) : (
                <>
                  <button type="submit" form="manual-form" disabled={isAnalyzing} className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-70 transition-colors">
                    {isAnalyzing ? 'Zapisywanie...' : 'Zapisz ubranie'}
                  </button>
                  <button onClick={() => setIsManualMode(false)} disabled={isAnalyzing} className="w-full text-blue-500 py-2 text-sm hover:text-blue-700">
                    Wróć do skanowania AI
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}