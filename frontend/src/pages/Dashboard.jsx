import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api/axiosConfig';
import ClothingCard from '../components/ClothingCard';
import ClothingSkeleton from '../components/ClothingSkeleton';

export default function Dashboard() {
  const [clothes, setClothes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtry i sortowanie
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Refy do wykrywania kliknięć poza elementami
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Wywalamy bzdurne opcje sortowania, zostawiamy konkret
  const sortOptions = [
    { id: 'newest', label: 'Najnowsze dodane' },
    { id: 'oldest', label: 'Najstarsze dodane' }
  ];

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('clothes/');
        setClothes(response.data);
      } catch (err) {
        setError('Błąd ładowania szafy.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClothes();
  }, []);

  // Obsługa kliknięcia poza dropdowny
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableCategories = useMemo(() => {
    const cats = new Set();
    clothes.forEach(item => {
      item.categories?.forEach(c => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [clothes]);

  const processedClothes = useMemo(() => {
    let result = [...clothes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.description?.toLowerCase().includes(q) || 
        item.color?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(item => 
        item.categories?.some(cat => selectedCategories.includes(cat))
      );
    }

    // Proste i logiczne sortowanie
    result.sort((a, b) => (sortBy === 'newest' ? b.id - a.id : a.id - b.id));

    return result;
  }, [clothes, searchQuery, sortBy, selectedCategories]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const activeSortLabel = sortOptions.find(opt => opt.id === sortBy)?.label || 'Sortuj';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Twoja Szafa 👗</h1>
        
        <div className="flex flex-wrap w-full lg:w-auto gap-3">
          <input
            type="text"
            placeholder="Szukaj..."
            className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* DROPDOWN KATEGORII */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors h-full ${
                selectedCategories.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'
              }`}
            >
              Kategorie {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              <span className={`text-[10px] transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase px-2">Filtruj po:</div>
                <div className="max-h-48 overflow-y-auto">
                  {availableCategories.length > 0 ? (
                    availableCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                        <span className="text-sm text-slate-700">{cat}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 p-2 italic">Brak kategorii</div>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <button 
                    onClick={() => setSelectedCategories([])}
                    className="w-full mt-2 pt-2 border-t border-slate-100 text-xs text-red-500 hover:text-red-700 font-medium text-center"
                  >
                    Wyczyść filtry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* DROPDOWN SORTOWANIA */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg flex items-center gap-2 transition-colors h-full min-w-[170px] justify-between"
            >
              <span className="truncate">{activeSortLabel}</span>
              <span className={`text-[10px] transition-transform ${isSortOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[170px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="py-1">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                        sortBy === option.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => <ClothingSkeleton key={idx} />)
        ) : processedClothes.length > 0 ? (
          processedClothes.map(item => <ClothingCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-100 rounded-2xl">
            Nie znaleziono ubrań.
          </div>
        )}
      </div>
    </div>
  );
}