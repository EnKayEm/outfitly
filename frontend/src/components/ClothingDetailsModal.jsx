import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { X, Pencil, Trash2, Save, AlignLeft, Palette, Tags, Calendar } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function ClothingDetailsModal({ isOpen, onClose, clothingId, onSuccess, availableCategories = [] }) {
  const [clothing, setClothing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stany dla trybu edycji
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({ description: '', color: '', categories: [] });
  const [customCategory, setCustomCategory] = useState('');

  // Stany dla usuwania
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const modalRef = useRef(null);
  useFocusTrap(modalRef, isOpen);

    useEffect(() => {
        if (!isOpen || !clothingId) return;

        const fetchClothingDetails = async () => {
        setIsLoading(true);
        setError(null);
        setIsEditing(false);
        setIsDeleteConfirmOpen(false);
        setIsDeleting(false); 
        setIsSaving(false);
        
        try {
            const response = await api.get(`clothes/${clothingId}/`);
            const data = response.data;
            
            if (data.categories) {
            data.categories = data.categories.filter(c => c && c.trim() !== '');
            }
            
            setClothing(data);
        } catch (err) {
            setError('Nie udało się pobrać szczegółów ubrania.');
        } finally {
            setIsLoading(false);
        }
        };

        fetchClothingDetails();

        return () => {
        setClothing(null);
        setIsEditing(false);
        setIsDeleteConfirmOpen(false);
        };
    }, [isOpen, clothingId]);

  // Aktywacja trybu edycji
  const handleEditClick = () => {
    setEditData({
      description: clothing.description || '',
      color: clothing.color || '',
      categories: clothing.categories || []
    });
    setIsEditing(true);
  };

  // Logika kategorii w trybie edycji (taka sama jak przy dodawaniu)
  const toggleCategory = (cat) => {
    setEditData(prev => {
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
    if (cleanCat && !editData.categories.includes(cleanCat)) {
      setEditData(prev => ({...prev, categories: [...prev.categories, cleanCat]}));
    }
    setCustomCategory('');
  };

  // Wywołanie PUT /clothes/<id>/update/
    const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append('description', editData.description);
    formData.append('color', editData.color);
    
    // Wymuszamy nadpisanie kategorii na backendzie
    if (editData.categories.length > 0) {
      editData.categories.forEach(cat => formData.append('categories', cat));
    } else {
      formData.append('categories', ''); 
    }

    try {
      await api.put(`clothes/${clothingId}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const cleanCategories = editData.categories.filter(c => c && c.trim() !== '');
      setClothing({ ...clothing, ...editData, categories: cleanCategories });
      
      setIsEditing(false);
      onSuccess(); 
    } catch (err) {
      setError('Błąd podczas zapisywania zmian.');
    } finally {
      setIsSaving(false);
    }
  };

  // Wywołanie DELETE /clothes/<id>/
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`clothes/${clothingId}/`);
      onSuccess(); 
      onClose();
    } catch (err) {
      setError('Błąd podczas usuwania ubrania.');
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="details-modal-title">
      <div ref={modalRef} className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] md:h-[650px] overflow-hidden">

        {/* Nagłówek (zamrożony na górze) */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white shrink-0">
          <h2 id="details-modal-title" className="text-xl font-bold text-slate-800">
            {isEditing ? 'Edycja ubrania' : 'Szczegóły ubrania'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving || isDeleting}
            aria-label="Zamknij okno"
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Główny kontener podzielony na dwie kolumny */}
        <div className="p-6 flex flex-col md:flex-row gap-8 h-full overflow-y-auto md:overflow-hidden">
          
          {/* LEWA STRONA */}
          <div className="w-full md:w-1/2 flex-shrink-0 md:h-full flex flex-col">
            {isLoading ? (
              <div className="w-full h-full min-h-[300px] bg-slate-200 rounded-2xl animate-pulse"></div>
            ) : error ? (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-red-50 text-red-600 rounded-2xl border border-red-100">Błąd ładowania obrazu</div>
            ) : clothing ? (
              <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                {clothing.image_url ? (
                  <img src={clothing.image_url} alt="Ubranie" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
                )}
              </div>
            ) : null}
          </div>
          
          {/* PRAWA STRONA: Informacje/Formularz */}
          <div className="w-full md:w-1/2 flex flex-col md:h-full md:overflow-y-auto pr-1 px-1">
             {isLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
                  <div className="h-8 bg-slate-200 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-1/4 mt-4"></div>
                  <div className="h-6 bg-slate-200 rounded-md w-1/2"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
              ) : clothing ? (
                <div className="flex flex-col h-full">
                  
                  {/* Sekcja Danych */}
                  <div className="flex-1">
                    {!isEditing ? (
                      // TRYB ODCZYTU
                      <div className="flex flex-col gap-6">
                        {/* DATA DODANIA */}
                        {clothing.creation_date && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Calendar aria-hidden="true" className="w-3 h-3" /> Data dodania
                            </p>
                            <p className="text-slate-700 font-medium text-lg">
                              {formatDate(clothing.creation_date)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlignLeft aria-hidden="true" className="w-3 h-3" /> Opis</p>
                          <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">{clothing.description || 'Brak opisu'}</h3>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Palette aria-hidden="true" className="w-3 h-3" /> Kolor</p>
                          <p className="text-slate-700 font-medium capitalize text-lg">{clothing.color || 'Brak koloru'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Tags aria-hidden="true" className="w-3 h-3" /> Kategorie</p>
                          <div className="flex flex-wrap gap-2">
                            {clothing.categories && clothing.categories.length > 0 ? (
                              clothing.categories.map((cat, idx) => (
                                <span key={idx} className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 shadow-sm">
                                  {cat}
                               </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400 italic">Brak przypisanych kategorii</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // TRYB EDYCJI
                      <form className="flex flex-col gap-5">
                        <div>
                          <label htmlFor="edit-description" className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Opis</label>
                          <textarea
                            id="edit-description"
                            rows="4"
                            value={editData.description}
                            onChange={e => setEditData({...editData, description: e.target.value})}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none shadow-sm transition-shadow"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-color" className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Kolor</label>
                          <input
                            id="edit-color"
                            type="text"
                            value={editData.color}
                            onChange={e => setEditData({...editData, color: e.target.value})}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-shadow"
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Kategorie</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {availableCategories.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(cat)}
                                disabled={isSaving}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-sm ${
                                  editData.categories.includes(cat) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {cat} {editData.categories.includes(cat) ? '✕' : '+'}
                              </button>
                            ))}
                            {editData.categories.filter(c => !availableCategories.includes(c)).map(cat => (
                              <span key={cat} className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-blue-50 border-blue-300 text-blue-700 flex items-center gap-1 shadow-sm">
                                {cat} <button type="button" onClick={() => toggleCategory(cat)} disabled={isSaving} className="hover:text-blue-900 font-bold ml-1">✕</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Dodaj własny tag..." 
                              className="flex-1 p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-slate-200 text-sm shadow-sm transition-shadow" 
                              value={customCategory} 
                              onChange={e => setCustomCategory(e.target.value)} 
                              onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory(e)}
                              disabled={isSaving}
                            />
                            <button type="button" onClick={handleAddCustomCategory} disabled={isSaving || !customCategory.trim()} className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-200 disabled:opacity-50 transition-colors">
                              Dodaj
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Stopka z akcjami - wewnątrz prawej kolumny, wypchnięta na sam dół (mt-auto) */}
                  <div className="mt-auto pt-6 border-t border-slate-100 shrink-0">
                    {isDeleteConfirmOpen ? (
                      <div className="flex flex-col xl:flex-row items-center justify-between gap-3 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in">
                        <span className="text-red-700 font-medium text-sm text-center xl:text-left">Usunąć ubranie na zawsze?</span>
                        <div className="flex gap-2 w-full xl:w-auto">
                          <button onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting} className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors">
                            Anuluj
                          </button>
                          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
                            {isDeleting ? 'Usuwanie...' : 'Usuń'}
                          </button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      <div className="flex justify-end gap-3 w-full">
                        <button onClick={() => setIsEditing(false)} disabled={isSaving} className="flex-1 sm:flex-none px-5 py-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 border border-transparent rounded-xl font-medium transition-colors text-sm">
                          Anuluj
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 text-sm">
                          <Save className="w-4 h-4" /> {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full sm:w-auto px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 border border-transparent hover:border-red-100">
                          <Trash2 className="w-4 h-4" /> Usuń ubranie
                        </button>
                        <button onClick={handleEditClick} className="w-full sm:w-auto px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-md flex items-center justify-center gap-2 text-sm">
                          <Pencil className="w-4 h-4" /> Edytuj dane
                        </button>
                      </div>
                    )}
                  </div>
                  
                </div>
              ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}