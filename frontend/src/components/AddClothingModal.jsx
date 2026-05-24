import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Bot, Camera, Sparkles, PencilLine, Save, X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function AddClothingModal({ isOpen, onClose, onSuccess, availableCategories = [] }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Stany logiki AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [tempId, setTempId] = useState(null); 
  
  // Stany trybu ręcznego
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState({ description: '', color: '', categories: [] });
  const [customCategory, setCustomCategory] = useState('');
  
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  useFocusTrap(modalRef, isOpen);

  // Czyszczenie URL-a z pamięci przeglądarki
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
      setTempId(null);
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

  const handleClose = async () => {
    if (tempId) {
      try {
        await api.delete(`clothes/${tempId}/`);
      } catch (err) {
        console.error('Nie udało się posprzątać osieroconego ubrania z bazy:', err);
      }
    }
    onClose();
  };

  // Wysyłka do analizy AI
  const handleAIUpload = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file); 

    try {
      const response = await api.post('clothes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { temp_id, ai_proposal } = response.data;
      
      // AI skończyło. Uzupełniamy formularz i pokazujemy go użytkownikowi
      setTempId(temp_id);
      setManualData({
        description: ai_proposal?.description || '',
        color: ai_proposal?.color || '',
        categories: ai_proposal?.categories || []
      });
      setIsManualMode(true);
      setIsAnalyzing(false);

    } catch (err) {
      setIsAnalyzing(false);
      if (err.response?.status === 400) {
        setError('AI Bouncer: To nie wygląda jak ubranie. Spróbuj inne zdjęcie lub użyj trybu ręcznego.');
      } else {
        setError('Błąd serwera podczas analizy AI. Spróbuj ponownie.');
      }
    }
  };

  // Wysyłka końcowa (obsługuje zarówno czysty tryb ręczny, jak i zatwierdzenie po AI)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!file && !tempId) return setError('Dodaj zdjęcie!');

    setIsAnalyzing(true);
    setError(null);

    try {
      if (tempId) {
        // SCENARIUSZ 1: Potwierdzamy dane wygenerowane przez AI
        await api.post('clothes/upload/confirm/', {
          temp_id: tempId,
          color: manualData.color,
          description: manualData.description,
          categories: manualData.categories
        });
        
        setTempId(null); 
      } else {
        // SCENARIUSZ 2: Użytkownik olał AI i od początku wpisywał ręcznie
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', manualData.description);
        formData.append('color', manualData.color);
        
        if (manualData.categories.length > 0) {
          manualData.categories.forEach(cat => formData.append('categories', cat));
        } else {
          formData.append('categories', '');
        }

        await api.post('clothes/manual/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setIsAnalyzing(false);
      setError('Nie udało się zapisać ubrania. Sprawdź logi serwera.');
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
    setCustomCategory('');
  };

  const handleRemoveImage = async () => {
    if (tempId) {
      setIsAnalyzing(true);
      try {
        await api.delete(`clothes/${tempId}/`);
      } catch (err) {
        console.error('Błąd usuwania tymczasowego rekordu', err);
      }
      setTempId(null);
      setIsAnalyzing(false);
    }
    
    setFile(null);
    setPreview(null);
    setIsManualMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] md:h-[650px] overflow-hidden">

        <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
          <h2 id="add-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isManualMode ? <PencilLine aria-hidden="true" className="w-5 h-5 text-slate-600" /> : <Bot aria-hidden="true" className="w-5 h-5 text-blue-600" />}
            {isManualMode ? (tempId ? 'Zweryfikuj dane od AI' : 'Dodaj ubranie ręcznie') : 'Zeskanuj ubranie AI'}
          </h2>
          <button onClick={handleClose} disabled={isAnalyzing} aria-label="Zamknij okno" className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8 h-full overflow-y-auto md:overflow-hidden">
          
          {/* LEWA STRONA: ZDJĘCIE */}
          <div className="w-full md:w-1/2 flex-shrink-0 md:h-full flex flex-col">
            <div className="flex-1 min-h-[300px]">
              {!preview ? (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Wybierz zdjęcie ubrania"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors"
                >
                  <Camera className="w-12 h-12 mx-auto mb-3 text-slate-400" strokeWidth={1.5} />
                  <p className="text-slate-600 font-medium">Kliknij, aby wybrać zdjęcie</p>
                  <p className="text-slate-400 text-sm mt-1">JPG, PNG (max 5MB)</p>
                </div>
              ) : (
                <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  <img src={preview} alt="Podgląd" className="w-full h-full object-contain p-2" />
                  
                  {/* Animacja skanowania AI */}
                  {isAnalyzing && !isManualMode && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center overflow-hidden z-10">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-blue-500/30 animate-[scan_2s_ease-in-out_infinite] border-b-2 border-blue-400 shadow-[0_5px_15px_rgba(59,130,246,0.6)]"></div>
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

                  {!isAnalyzing && (
                    <button
                      onClick={handleRemoveImage}
                      aria-label="Usuń zdjęcie"
                      className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={isAnalyzing || tempId} />
            </div>
          </div>

          {/* PRAWA STRONA: FORMULARZ */}
          <div className="w-full md:w-1/2 flex flex-col md:h-full md:overflow-y-auto px-2">
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 shrink-0 shadow-sm">
                {error}
              </div>
            )}

            {!preview && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-xl min-h-[200px]">
                 <p className="text-slate-400 text-sm">Wgraj zdjęcie po lewej stronie, aby odblokować panel edycji i funkcje AI.</p>
              </div>
            )}

            {isManualMode && preview && (
              <form id="manual-form" onSubmit={handleSave} className="flex flex-col gap-4 flex-1">
                
                <div className="flex flex-col gap-1 shrink-0">
                  <label htmlFor="add-description" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Opis ubrania</label>
                  <textarea
                    id="add-description"
                    required
                    rows="4"
                    placeholder="np. Zielona czapka zimowa z pomponem"
                    className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-slate-200 resize-none text-sm transition-shadow shrink-0"
                    value={manualData.description}
                    onChange={e => setManualData({...manualData, description: e.target.value})}
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <label htmlFor="add-color" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kolor dominujący</label>
                  <input
                    id="add-color"
                    required
                    type="text"
                    placeholder="np. Zielony"
                    className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-slate-200 text-sm transition-shadow shrink-0"
                    value={manualData.color}
                    onChange={e => setManualData({...manualData, color: e.target.value})}
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="flex flex-col gap-2 mt-2 shrink-0 pb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kategorie i tagi</p>
                   
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          manualData.categories.includes(cat)
                            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        disabled={isAnalyzing}
                      >
                        {cat} {manualData.categories.includes(cat) ? '✕' : '+'}
                      </button>
                    ))}
                    
                    {manualData.categories.filter(c => !availableCategories.includes(c)).map(cat => (
                      <span key={cat} className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-blue-50 border-blue-300 text-blue-700 flex items-center gap-1 shadow-sm">
                        {cat} 
                        <button type="button" disabled={isAnalyzing} onClick={() => toggleCategory(cat)} className="hover:text-blue-900 font-bold ml-1">✕</button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      placeholder="Dodaj własny tag..." 
                      className="flex-1 p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-slate-200 text-sm transition-shadow" 
                      value={customCategory} 
                      onChange={e => setCustomCategory(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory(e)}
                      disabled={isAnalyzing}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCustomCategory}
                      className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
                      disabled={isAnalyzing || !customCategory.trim()}
                    >
                      Dodaj
                    </button>
                  </div>
                </div>
              </form>
            )}

            {!isManualMode && preview && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-blue-50/50 rounded-xl border border-blue-100/50 min-h-[200px]">
                 <Bot className="w-12 h-12 text-blue-300 mb-3" />
                 <p className="text-slate-500 text-sm leading-relaxed">Uruchom AI, aby automatycznie rozpoznać szczegóły ubrania. W przeciwnym razie możesz uzupełnić formularz ręcznie.</p>
              </div>
            )}

            {preview && (
              <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-100 shrink-0">
                {!isManualMode ? (
                  <>
                    <button onClick={handleAIUpload} disabled={isAnalyzing} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md hover:shadow-lg">
                      <Sparkles className="w-5 h-5" /> {isAnalyzing ? 'Przetwarzanie AI...' : 'Zeskanuj ubranie AI'}
                    </button>
                    <button onClick={() => setIsManualMode(true)} disabled={isAnalyzing} className="w-full text-slate-500 py-2 text-sm font-medium hover:text-slate-800 transition-colors">
                      Pomiń AI i dodaj ręcznie
                    </button>
                  </>
                ) : (
                  <>
                    <button type="submit" form="manual-form" disabled={isAnalyzing} className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-900 disabled:opacity-70 transition-all shadow-md hover:shadow-lg">
                      <Save className="w-5 h-5" /> {isAnalyzing ? 'Zapisywanie...' : 'Zapisz ubranie w szafie'}
                    </button>
                    <button onClick={handleRemoveImage} disabled={isAnalyzing} className="w-full text-blue-600 py-2 text-sm font-medium hover:text-blue-800 transition-colors">
                      {tempId ? 'Odrzuć dane i wróć do skanowania' : 'Wróć do menu skanowania'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>  

      </div>
    </div>
  );
}