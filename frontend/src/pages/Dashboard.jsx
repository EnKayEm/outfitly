import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api/axiosConfig';
import ClothingCard from '../components/ClothingCard';
import ClothingSkeleton from '../components/ClothingSkeleton';
import AddClothingModal from '../components/AddClothingModal';

export default function Dashboard() {
  const [clothes, setClothes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stany dla filtrów i sortowania
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]); // Nowy stan dla kolorów
  const [sortBy, setSortBy] = useState('newest');

  // Stany dla otwarcia dropdownów
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false); // Dropdown kolorów
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Refy do zamykania przy kliknięciu w tło
  const filterRef = useRef(null);
  const colorRef = useRef(null);
  const sortRef = useRef(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const sortOptions = [
    { id: 'newest', label: 'Najnowsze' },
    { id: 'oldest', label: 'Najstarsze' }
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
}, [refreshTrigger]);

  // Globalny nasłuchiwacz kliknięć poza elementami
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setIsColorOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamiczne wyciąganie dostępnych kategorii
  const availableCategories = useMemo(() => {
    const cats = new Set();
    clothes.forEach(item => {
      item.categories?.forEach(c => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [clothes]);

  // Dynamiczne wyciąganie dostępnych kolorów (z małym zabezpieczeniem, żeby ujednolicić wielkość liter)
  const availableColors = useMemo(() => {
    const colors = new Set();
    clothes.forEach(item => {
      if (item.color) {
        // Kapitalizujemy pierwszą literę, żeby uniknąć duplikatów typu "zielony" i "Zielony"
        const formattedColor = item.color.charAt(0).toUpperCase() + item.color.slice(1).toLowerCase();
        colors.add(formattedColor);
        // Nadpisujemy oryginalny kolor w obiekcie dla spójności podczas filtrowania
        item.normalizedColor = formattedColor; 
      }
    });
    return Array.from(colors).sort();
  }, [clothes]);

  // Serce logiki
  const processedClothes = useMemo(() => {
    let result = [...clothes];

    // 1. Wyszukiwanie (Tylko po opisie!)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.description?.toLowerCase().includes(q)
      );
    }

    // 2. Filtr Kategorii
    if (selectedCategories.length > 0) {
      result = result.filter(item => 
        item.categories?.some(cat => selectedCategories.includes(cat))
      );
    }

    // 3. Filtr Kolorów
    if (selectedColors.length > 0) {
      result = result.filter(item => 
        selectedColors.includes(item.normalizedColor)
      );
    }

    // 4. Sortowanie
    result.sort((a, b) => (sortBy === 'newest' ? b.id - a.id : a.id - b.id));

    return result;
  }, [clothes, searchQuery, selectedCategories, selectedColors, sortBy]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const activeSortLabel = sortOptions.find(opt => opt.id === sortBy)?.label || 'Sortuj';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Twoja Szafa 👗</h1>
        
        <div className="flex flex-wrap w-full lg:w-auto gap-3">
          {/* Szukajka */}
          <input
            type="text"
            placeholder="Szukaj po nazwie..."
            className="flex-1 min-w-[150px] px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* DROPDOWN KATEGORII */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsColorOpen(false);
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
                  <button onClick={() => setSelectedCategories([])} className="w-full mt-2 pt-2 border-t border-slate-100 text-xs text-red-500 hover:text-red-700 font-medium text-center">
                    Wyczyść filtry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* DROPDOWN KOLORÓW */}
          <div className="relative" ref={colorRef}>
            <button 
              onClick={() => {
                setIsColorOpen(!isColorOpen);
                setIsFilterOpen(false);
                setIsSortOpen(false);
              }}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors h-full ${
                selectedColors.length > 0 ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white'
              }`}
            >
              Kolory {selectedColors.length > 0 && `(${selectedColors.length})`}
              <span className={`text-[10px] transition-transform ${isColorOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isColorOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase px-2">Filtruj kolor:</div>
                <div className="max-h-48 overflow-y-auto">
                  {availableColors.length > 0 ? (
                    availableColors.map(color => (
                      <label key={color} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                        />
                        <span className="text-sm text-slate-700">{color}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 p-2 italic">Brak kolorów</div>
                  )}
                </div>
                {selectedColors.length > 0 && (
                  <button onClick={() => setSelectedColors([])} className="w-full mt-2 pt-2 border-t border-slate-100 text-xs text-red-500 hover:text-red-700 font-medium text-center">
                    Wyczyść kolory
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
                setIsColorOpen(false);
              }}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg flex items-center justify-between gap-2 transition-colors h-full hover:bg-slate-50 min-w-[190px]"
            >
              <span className="font-medium text-slate-800 truncate">
                <span className="text-slate-500 font-normal mr-1">Sortuj:</span> 
                {activeSortLabel}
              </span>
              <span className={`text-[10px] text-slate-400 transition-transform ml-1 ${isSortOpen ? 'rotate-180' : ''}`}>▼</span>
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

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span> Dodaj Ubranie
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => <ClothingSkeleton key={idx} />)
        ) : processedClothes.length > 0 ? (
          processedClothes.map(item => <ClothingCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-100 rounded-2xl">
            Nie znaleziono ubrań dla podanych kryteriów.
          </div>
        )}
      </div>
      <AddClothingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
        availableCategories={availableCategories}
      />
    </div>
  );
}