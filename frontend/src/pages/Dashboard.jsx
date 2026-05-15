import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api/axiosConfig';
import ClothingCard from '../components/ClothingCard';
import ClothingSkeleton from '../components/ClothingSkeleton';
import AddClothingModal from '../components/AddClothingModal';
import ClothingDetailsModal from '../components/ClothingDetailsModal';
import { Shirt, Plus, Search, Filter, ArrowUpDown, Palette, ListFilter, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [clothes, setClothes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);



  // Stany dla filtrów i sortowania
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]); // Nowy stan dla kolorów
  const [sortBy, setSortBy] = useState('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedColors, sortBy]);

  // Stany dla otwarcia dropdownów
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false); // Dropdown kolorów
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterRef = useRef(null);
  const colorRef = useRef(null);
  const sortRef = useRef(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedClothingId, setSelectedClothingId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const sortOptions = [
    { id: 'newest', label: 'Najnowsze' },
    { id: 'oldest', label: 'Najstarsze' },
    { id: 'color_asc', label: 'Kolor (A-Z)' },
    { id: 'color_desc', label: 'Kolor (Z-A)' }
  ];

  const FancyCheck = ({ isChecked }) => (
  <div className={`w-5 h-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center shrink-0 ${
    isChecked 
      ? 'bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]' 
      : 'bg-white border-slate-300 group-hover:border-slate-400'
  }`}>
    {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />}
  </div>
);

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

  const availableCategories = useMemo(() => {
    const cats = new Set();
    clothes.forEach(item => {
      item.categories?.forEach(c => {
        if (c && c.trim() !== '') cats.add(c.trim());
      });
    });
    return Array.from(cats).sort();
  }, [clothes]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    clothes.forEach(item => {
      if (item.color) {
        const formattedColor = item.color.charAt(0).toUpperCase() + item.color.slice(1).toLowerCase();
        colors.add(formattedColor);
        item.normalizedColor = formattedColor; 
      }
    });
    return Array.from(colors).sort();
  }, [clothes]);

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
    result.sort((a, b) => {
      // Pobieramy daty, używając poprawnego klucza z backendu (creation_date)
      const dateA = new Date(a.creation_date || 0).getTime();
      const dateB = new Date(b.creation_date || 0).getTime();
      const colorA = a.color || "";
      const colorB = b.color || "";

      switch (sortBy) {
        case 'newest':
          // Od najnowszych (jeśli daty równe, sortuje po kolorze A-Z)
          if (dateA !== dateB) return dateB - dateA;
          return colorA.localeCompare(colorB);
          
        case 'oldest':
          // Od najstarszych
          if (dateA !== dateB) return dateA - dateB;
          return colorA.localeCompare(colorB);
          
        case 'color_asc':
          // Kolor alfabetycznie A-Z
          return colorA.localeCompare(colorB);
          
        case 'color_desc':
          // Kolor alfabetycznie Z-A
          return colorB.localeCompare(colorA);
          
        default:
          return 0;
      }
    });

    return result;
  }, [clothes, searchQuery, selectedCategories, selectedColors, sortBy]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const activeSortLabel = sortOptions.find(opt => opt.id === sortBy)?.label || 'Sortuj';

  const totalPages = Math.ceil(processedClothes.length / itemsPerPage);
  const currentClothes = processedClothes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 3; // Ile stron pokazywać wokół obecnej

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); // Zawsze pierwsza

        if (currentPage > 3) pages.push('...');

        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Korekta okienka przy końcach
        if (currentPage <= 3) end = 4;
        if (currentPage >= totalPages - 2) start = totalPages - 3;

        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages); // Zawsze ostatnia
      }
      return pages;
    };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Twoja Szafa <Shirt className="text-blue-600 w-6 h-6" />
        </h1>
        
        <div className="flex flex-wrap w-full lg:w-auto gap-3">
          {/* Szukajka z ikoną */}
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj po nazwie..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
                      <label key={cat} className="group flex items-center gap-3 py-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="hidden" // Ukrywamy natywny checkbox
                          checked={selectedCategories.includes(cat)} 
                          onChange={() => toggleCategory(cat)} 
                        />
                        <FancyCheck isChecked={selectedCategories.includes(cat)} />
                        <span className="text-slate-700 text-sm group-hover:text-blue-600 transition-colors">
                          {cat}
                        </span>
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
                selectedColors.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'
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
                      <label key={color} className="group flex items-center gap-3 py-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedColors.includes(color)} 
                          onChange={() => toggleColor(color)} 
                        />
                        <FancyCheck isChecked={selectedColors.includes(color)} />
                        <span className="text-slate-700 text-sm group-hover:text-blue-600 transition-colors capitalize">
                          {color}
                        </span>
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
              <span className={`text-[10px] text-slate-900 transition-transform ml-1 ${isSortOpen ? 'rotate-180' : ''}`}>▼</span>
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
            <Plus className="w-5 h-5" /> Dodaj Ubranie
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => <ClothingSkeleton key={idx} />)
        ) : currentClothes.length > 0 ? ( // ZMIANA: używamy currentClothes
            currentClothes.map(item => (
              <ClothingCard 
                key={item.id} 
                item={item} 
                onClick={(id) => {
                  setSelectedClothingId(id);
                  setIsDetailsModalOpen(true);
                }}
              />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-100 rounded-2xl">
            Nie znaleziono ubrań dla podanych kryteriów.
          </div>
        )}
      </div>
      {/* Paginacja - pojawia się tylko, gdy jest więcej niż 1 strona */}
{totalPages > 1 && (
  <div className="flex flex-wrap justify-center items-center gap-2 mt-10 mb-6">
    {/* Przycisk Poprzednia */}
    <button 
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 flex items-center justify-center"
    >
      <span className="sr-only">Poprzednia</span>
      <ChevronLeft className="w-5 h-5" />
    </button>

    {/* Numery stron */}
    <div className="flex items-center gap-1">
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`dots-${index}`} className="px-3 py-2 text-slate-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
              currentPage === page 
                ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' 
                : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
            }`}
          >
            {page}
          </button>
        )
      ))}
    </div>

    {/* Przycisk Następna */}
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
      <AddClothingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
        availableCategories={availableCategories}
      />
      <ClothingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClothingId(null);
        }}
        clothingId={selectedClothingId}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        availableCategories={availableCategories} 
      />
    </div>
  );
}