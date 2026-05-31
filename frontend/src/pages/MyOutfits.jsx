
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ClothingCard from '../components/ClothingCard';
import SwapClothingModal from '../components/SwapClothingModal';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';
import { demoOutfits, demoClothes } from '../data/demoData';
import ClothingDetailsModal from '../components/ClothingDetailsModal';
import { Heart, Trash2, ChevronLeft, ChevronRight, Shirt, PencilRuler, Plus, X, AlertTriangle } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function MyOutfits() {
  const [selectedClothingId, setSelectedClothingId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const outfitsPerPage = 6;
  const [outfitToDelete, setOutfitToDelete] = useState(null);
  const navigate = useNavigate();

  // Stany edycji
  const [allClothes, setAllClothes] = useState([]);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [editedIds, setEditedIds] = useState([]);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemToSwap, setItemToSwap] = useState(null);

  const fetchOutfits = async () => {
    if (!isAuthenticated()) {
      setOutfits(demoOutfits);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('compositions/');
      setOutfits(res.data);
    } catch (err) {
      console.error(err);
      setError('Nie udało się pobrać stylizacji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
    if (!isAuthenticated()) {
      setAllClothes(demoClothes);
      return;
    }
    api.get('clothes/').then(r => setAllClothes(r.data)).catch(() => {});
  }, []);

  const toggleFavorite = async (id) => {
    if (!isAuthenticated()) { setShowGuestModal(true); return; }

    try {
      const res = await api.patch(`compositions/${id}/favourite/`);

      setOutfits(prev =>
        prev.map(o =>
          o.id === id
            ? { ...o, is_favourite: res.data.is_favourite }
            : o
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated()) { setShowGuestModal(true); return; }

    try {
      await api.delete(`compositions/${id}/delete/`);
      setOutfits(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Edycja ---
  const openEdit = (outfit) => {
    if (!isAuthenticated()) { setShowGuestModal(true); return; }
    setEditingOutfit(outfit);
    setEditedIds(outfit.clothes?.map(c => String(c.id)) ?? []);
  };

  const handleEditSwap = (newId) => {
    setEditedIds(prev => prev.map(id => id === String(itemToSwap) ? String(newId) : id));
    setIsSwapOpen(false);
    setItemToSwap(null);
  };

  const handleEditAdd = (newId) => {
    setEditedIds(prev => {
      if (prev.includes(String(newId))) return prev;
      return [...prev, String(newId)];
    });
    setIsAddOpen(false);
  };

  const handleEditRemove = (itemId) => {
    setEditedIds(prev => prev.filter(id => id !== String(itemId)));
  };

  const handleSaveEdit = async () => {
    try {
      const newClothes = allClothes.filter(c =>
        editedIds.includes(String(c.id))
      );

      await api.put(`compositions/${editingOutfit.id}/update/`, {
        outfit_ids: editedIds.map(id => Number(id)),
      });

      setOutfits(prev =>
        prev.map(o =>
          o.id === editingOutfit.id
            ? { ...o, clothes: newClothes }
            : o
        )
      );

      setEditingOutfit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const editedClothes = allClothes.filter(c => editedIds.includes(String(c.id)));

  const filteredOutfits = outfits.filter(o => showFavorites ? o.is_favourite : true);
  const indexOfLast = currentPage * outfitsPerPage;
  const indexOfFirst = indexOfLast - outfitsPerPage;
  const currentOutfits = filteredOutfits.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOutfits.length / outfitsPerPage);

  if (loading) return <p className="text-center mt-10">Ładowanie...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">

      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Moje Stylizacje <Shirt className="text-blue-600 w-6 h-6" />
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowFavorites(false); setCurrentPage(1); }}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 ${
              !showFavorites
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => { setShowFavorites(true); setCurrentPage(1); }}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFavorites
                ? 'border-pink-400 bg-pink-50 text-pink-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-4 h-4" /> Ulubione
          </button>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
      {filteredOutfits.length === 0 ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-100 rounded-2xl">
          {showFavorites ? (
            <>
              <Heart className="w-10 h-10 mx-auto mb-3 text-pink-300" />
              <p className="text-lg">Nie masz jeszcze ulubionych stylizacji</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-4">Brak zapisanych stylizacji.</p>
              <button
                onClick={() => navigate('/style-creator')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Przejdź do kreatora stylizacji
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {currentOutfits.map((outfit) => (
              <div key={outfit.id} className="bg-slate-50 p-5 rounded-xl border border-slate-100">

                {/* Nagłówek karty stylizacji */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Okazja: {outfit.occasion || 'Brak'}
                    </h2>
                    {formatDate(outfit.creation_date) && (
                      <p className="text-sm text-slate-400 mt-0.5">
                        {formatDate(outfit.creation_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(outfit)}
                      className="p-2 rounded-lg text-slate-300 hover:text-purple-500 hover:bg-white transition-colors"
                      title="Edytuj stylizację"
                    >
                      <PencilRuler className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(outfit.id)}
                      className={`p-2 rounded-lg transition-colors hover:bg-white ${
                        outfit.is_favourite ? 'text-pink-500' : 'text-slate-300 hover:text-pink-400'
                      }`}
                      title={outfit.is_favourite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                    >
                      <Heart className="w-5 h-5" fill={outfit.is_favourite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setOutfitToDelete(outfit)}
                      className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-white transition-colors"
                      title="Usuń stylizację"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Siatka ubrań */}
                {outfit.clothes?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {outfit.clothes.map((item) => (
                      <ClothingCard
                        key={item.id}
                        item={item}
                        onClick={(id) => {
                          if (!isAuthenticated()) { setShowGuestModal(true); return; }
                          setSelectedClothingId(id);
                          setIsDetailsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Wszystkie ubrania z tej stylizacji zostały usunięte z szafy. Skorzystaj z ikon powyżej, aby dodać nowe elementy lub usunąć tę stylizację.
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Paginacja */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-10 mb-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 flex items-center justify-center"
              >
                <span className="sr-only">Poprzednia</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 flex items-center justify-center"
              >
                <span className="sr-only">Następna</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
      </div>

      {/* Modal edycji stylizacji */}
      {editingOutfit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Nagłówek modalu */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <PencilRuler className="w-5 h-5 text-purple-600" /> Edytuj stylizację
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Okazja: {editingOutfit.occasion}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingOutfit(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Anuluj
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editedClothes.length === 0}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zapisz zmiany
                </button>
              </div>
            </div>

            {/* Siatka ubrań w trybie edycji */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {editedClothes.map(item => (
                  <ClothingCard key={item.id} item={item} onClick={() => {}}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditRemove(item.id); }}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:border-red-300 transition-all z-10"
                      title="Usuń z zestawu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setItemToSwap(item.id); setIsSwapOpen(true); }}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-purple-600 hover:border-purple-300 transition-all z-10"
                      title="Podmień element"
                    >
                      <PencilRuler className="w-4 h-4" />
                    </button>
                  </ClothingCard>
                ))}

                {/* Kafelek dodawania */}
                <div
                  onClick={() => setIsAddOpen(true)}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-6 cursor-pointer hover:bg-white hover:border-purple-400 transition-all min-h-[200px] group"
                >
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-purple-100 rounded-full flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
                  </div>
                  <span className="font-medium text-slate-500 group-hover:text-purple-700 text-sm">Dodaj element</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modalne SwapClothing */}
      <SwapClothingModal
        isOpen={isSwapOpen}
        onClose={() => { setIsSwapOpen(false); setItemToSwap(null); }}
        clothes={allClothes}
        currentOutfitIds={editedIds}
        onSwap={handleEditSwap}
        mode="swap"
      />
      <SwapClothingModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        clothes={allClothes}
        currentOutfitIds={editedIds}
        onSwap={handleEditAdd}
        mode="add"
      />

      {/* Modal potwierdzenia usunięcia */}
      {outfitToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-[400px] p-6">
            <button onClick={() => setOutfitToDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Usuń stylizację</h2>
            <p className="text-slate-500 mb-6">Czy na pewno chcesz usunąć tę stylizację?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOutfitToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Anuluj
              </button>
              <button
                onClick={() => { handleDelete(outfitToDelete.id); setOutfitToDelete(null); }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal dla gości */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-[400px] p-6 text-center">
            <button onClick={() => setShowGuestModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Funkcja dostępna po zalogowaniu</h2>
            <p className="text-slate-500 mb-6">Jesteś w trybie demo. Zaloguj się, aby korzystać z tej funkcji.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowGuestModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                Zostań w demo
              </button>
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                Zaloguj się
              </button>
            </div>
          </div>
        </div>
      )}

      <ClothingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedClothingId(null); }}
        clothingId={selectedClothingId}
      />

    </div>
  );
}
