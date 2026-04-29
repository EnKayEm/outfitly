import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

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

  useEffect(() => {
    if (!isOpen || !clothingId) return;

    const fetchClothingDetails = async () => {
    setIsLoading(true);
    setError(null);
    setIsEditing(false);
    setIsDeleteConfirmOpen(false);
    // DODAJ TE DWIE LINIJKI:
    setIsDeleting(false); 
    setIsSaving(false);
    
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
    
    if (editData.categories.length > 0) {
        editData.categories.forEach(cat => formData.append('categories', cat));
    } else {
        formData.append('categories', '');
    }

    try {
        await api.put(`clothes/${clothingId}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
        });
        setClothing({ ...clothing, ...editData });
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
      onSuccess(); // Odświeża siatkę w Dashboardzie
      onClose(); // Zamykamy modal, bo ubrania już nie ma
    } catch (err) {
      setError('Błąd podczas usuwania ubrania.');
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Nagłówek */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? 'Edycja ubrania' : 'Szczegóły ubrania'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSaving || isDeleting}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Ciało Modala */}
        <div className="p-6 overflow-y-auto flex-1">
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
              {/* Zdjęcie (nieedytowalne) */}
              <div className="w-full md:w-1/2">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                  {clothing.image_url ? (
                    <img src={clothing.image_url} alt="Ubranie" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>
                  )}
                </div>
              </div>
              
              {/* Informacje lub Formularz */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                {!isEditing ? (
                  // TRYB ODCZYTU
                  <>
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
                  </>
                ) : (
                  // TRYB EDYCJI
                  <form className="flex flex-col gap-3 h-full">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Opis</label>
                      <input 
                        type="text" 
                        value={editData.description} 
                        onChange={e => setEditData({...editData, description: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 outline-none text-sm"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Kolor</label>
                      <input 
                        type="text" 
                        value={editData.color} 
                        onChange={e => setEditData({...editData, color: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 outline-none text-sm"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Kategorie</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {availableCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            disabled={isSaving}
                            className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                              editData.categories.includes(cat) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            {cat} {editData.categories.includes(cat) ? '✕' : '+'}
                          </button>
                        ))}
                        {editData.categories.filter(c => !availableCategories.includes(c)).map(cat => (
                          <span key={cat} className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 border-blue-300 text-blue-700 flex items-center gap-1">
                            {cat} <button type="button" onClick={() => toggleCategory(cat)} disabled={isSaving} className="hover:text-blue-900 font-bold">✕</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Nowa kategoria..." 
                          className="flex-1 p-2 border rounded-lg focus:ring-2 outline-none border-slate-200 text-sm" 
                          value={customCategory} 
                          onChange={e => setCustomCategory(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory(e)}
                          disabled={isSaving}
                        />
                        <button type="button" onClick={handleAddCustomCategory} disabled={isSaving || !customCategory.trim()} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm hover:bg-slate-200">
                          Dodaj
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Stopka z akcjami (Widoczna tylko, gdy załadowano dane) */}
        {!isLoading && !error && clothing && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            {isDeleteConfirmOpen ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                <span className="text-red-700 font-medium text-sm">Czy na pewno chcesz usunąć to ubranie?</span>
                <div className="flex gap-2 w-full sm:w-auto">
                {/* Dodano: whitespace-nowrap, flex, items-center, justify-center i sztywne h-10 */}
                <button onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeleting} className="flex-1 px-4 h-10 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-sm whitespace-nowrap flex items-center justify-center transition-colors">
                    Anuluj
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm whitespace-nowrap flex items-center justify-center transition-colors">
                    {isDeleting ? 'Usuwanie...' : 'Tak, usuń'}
                </button>
                </div>
            </div>
            ) : isEditing ? (
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-5 py-2 text-slate-500 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                  Anuluj
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <button onClick={() => setIsDeleteConfirmOpen(true)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm">
                  Usuń ubranie
                </button>
                <button onClick={handleEditClick} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors shadow-sm">
                  Edytuj
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}