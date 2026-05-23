
import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import ClothingCard from '../components/ClothingCard';
import { useNavigate } from 'react-router-dom';

export default function MyOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const outfitsPerPage = 6;
  const [outfitToDelete, setOutfitToDelete] = useState(null);
  const navigate = useNavigate();


  const fetchOutfits = async () => {
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

// toggle favorite (frontend only)
const toggleFavorite = (id) => {
  setOutfits(prev =>
    prev.map(o =>
      o.id === id ? { ...o, is_favorite: !o.is_favorite } : o
    )
  );
};

// 🗑 usuwanie (frontend only)
const handleDelete = (id) => {
  setOutfits(prev => prev.filter(o => o.id !== id));
};

const filteredOutfits = outfits.filter(o =>
  showFavorites ? o.is_favorite : true
);

const indexOfLast = currentPage * outfitsPerPage;
const indexOfFirst = indexOfLast - outfitsPerPage;

const currentOutfits = filteredOutfits.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(filteredOutfits.length / outfitsPerPage);


  useEffect(() => {
    fetchOutfits();
    
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Ładowanie...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${
          filteredOutfits.length === 0 ? 'text-center' : 'text-left'
        }`}>
          Moje stylizacje
        </h1>

        <div className={`mb-6 flex gap-3 ${
          filteredOutfits.length === 0 ? 'justify-center' : 'justify-start'
        }`}>
        <button
            onClick={() => {
            setShowFavorites(false);
            setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded transition ${
            !showFavorites
                ? 'bg-blue-600 text-white shadow'
                : 'bg-blue-100 text-slate-700 hover:bg-blue-200'
            }`}
        >
            Wszystkie
        </button>

        <button
            onClick={() => {
            setShowFavorites(true);
            setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded transition ${
            showFavorites
                ? 'bg-pink-500 text-white shadow'
                : 'bg-pink-100 text-slate-700 hover:bg-pink-200'
            }`}
        >
            Ulubione ❤️
        </button>
        </div>
      
      {filteredOutfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          
          {showFavorites && (
            <div className="text-4xl mb-3">❤️</div>
          )}

        <p className="text-slate-500 text-lg mb-4">
          {showFavorites
            ? 'Nie masz jeszcze ulubionych stylizacji'
            : 'Brak zapisanych stylizacji.'}
        </p>

        {/* ✅ przycisk tylko dla "Wszystkie" */}
        {!showFavorites && (
          <button
            onClick={() => navigate('/style-creator')}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Przejdź do kreatora stylizacji
          </button>
        )}

        </div>
      ) : (
        <>
        <div className="space-y-8">
          {
            currentOutfits.map((outfit) => (
            <div key={outfit.id} className="bg-white p-4 rounded-xl shadow border">
              <h2 className="font-semibold mb-2">
                Okazja: {outfit.occasion || 'Brak'}
              </h2>

              {/* jeśli backend zwraca ubrania */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">          
                {outfit.clothes?.map((item) => (
                <ClothingCard key={item.id} item={item} />
                ))}
              </div>

              {/* ❤️ serduszko */}
                <button
                onClick={() => toggleFavorite(outfit.id)}
                className="mt-4 text-2xl hover:scale-110 transition"
                >
                {outfit.is_favorite ? '❤️' : '🤍'}
                </button>

                {/* 🗑 przycisk usuwania */}
                <button
                onClick={() => setOutfitToDelete(outfit)}
                className="mt-2 text-red-500 hover:underline text-sm block"
                >
                Usuń stylizację
                </button>

            </div>
          ))}
        </div>
        

        {/* ✅ PAGINACJA */}
                <div className="flex justify-center mt-8 gap-2">
                    <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
                    disabled={currentPage === 1}
                    >
                    ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                    >
                        {i + 1}
                    </button>
                    ))}

                    <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200"
                    disabled={currentPage === totalPages}
                    >
                    →
                    </button>
                </div>
                </>

      )}

      {/* MODAL USUWANIA */}
      {outfitToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-[400px] p-6">
            
            {/* ❌ X */}
            <button
              onClick={() => setOutfitToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Usuń stylizację
            </h2>

            <p className="text-slate-500 mb-6">
              Czy na pewno chcesz usunąć tę stylizację?
            </p>

            <div className="flex justify-end gap-3">
              
              <button
                onClick={() => setOutfitToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Anuluj
              </button>

              <button
                onClick={() => {
                  handleDelete(outfitToDelete.id);
                  setOutfitToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Usuń
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

