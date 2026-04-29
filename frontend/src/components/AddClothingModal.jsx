import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';

//Poprawić dane wprowadzane ręcznie 
//Zwiększyć miejsce w pojednyczym ubraniu, by wyświetlało się węcei tekstu, (więcej miesca na początku)
//Zmniejszyć szerokość panelu od sortowania

export default function AddClothingModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Stany logiki AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  // Stany trybu ręcznego
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState({ category: '', color: '', material: '' });
  
  const fileInputRef = useRef(null);

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
      setManualData({ category: '', color: '', material: '' });
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
    formData.append('category', manualData.category);
    formData.append('color', manualData.color);
    formData.append('material', manualData.material); // Oby to pole istniało u was na backendzie...

    try {
      await api.post('clothes/manual/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
      onClose();
    } catch (err) {
      setIsAnalyzing(false);
      setError('Nie udało się zapisać ubrania ręcznie.');
    }
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
            <form id="manual-form" onSubmit={handleManualUpload} className="flex flex-col gap-3 mb-4">
              <input required type="text" placeholder="Kategoria (np. Buty)" className="p-2 border rounded-lg focus:ring-2 outline-none" value={manualData.category} onChange={e => setManualData({...manualData, category: e.target.value})} disabled={isAnalyzing}/>
              <input required type="text" placeholder="Kolor (np. Czarny)" className="p-2 border rounded-lg focus:ring-2 outline-none" value={manualData.color} onChange={e => setManualData({...manualData, color: e.target.value})} disabled={isAnalyzing}/>
              <input required type="text" placeholder="Materiał (np. Bawełna)" className="p-2 border rounded-lg focus:ring-2 outline-none" value={manualData.material} onChange={e => setManualData({...manualData, material: e.target.value})} disabled={isAnalyzing}/>
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