import { useState, useEffect } from 'react';
import { X, ArrowLeftRight, SearchX, Search, Filter, Palette } from 'lucide-react';
import ClothingCard from './ClothingCard';

export default function SwapClothingModal({ isOpen, onClose, clothes, currentOutfitIds, onSwap }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Resetujemy filtry po każdym otwarciu modala
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('');
      setSelectedColor('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Odsiewamy ubrania, które już są w zestawie
  const availableClothes = clothes.filter(c => !currentOutfitIds.includes(c.id));

  // 2. Wyciągamy unikalne kategorie i kolory DO LIST ROZWIJANYCH (tylko z dostępnych ubrań)
  const allCategories = [...new Set(availableClothes.flatMap(c => c.categories || []))]
    .filter(cat => cat && cat.trim() !== '')
    .sort();
  const allColors = [...new Set(availableClothes.map(c => c.color))]
    .filter(color => color && color.trim() !== '')
    .sort();

  // 3. Aplikujemy filtry użytkownika
  const filteredClothes = availableClothes.filter(item => {
    const matchesSearch = (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.categories?.includes(selectedCategory) : true;
    const matchesColor = selectedColor ? item.color?.toLowerCase() === selectedColor.toLowerCase() : true;
    
    return matchesSearch && matchesCategory && matchesColor;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Nagłówek Modala */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-purple-600" />
            Wybierz ubranie na podmianę
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 border border-slate-200 p-2 rounded-full transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pasek Filtrów]*/}
        {availableClothes.length > 0 && (
          <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-3 shrink-0 shadow-sm z-10">
            {/* Wyszukiwarka */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Szukaj po nazwie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-shadow"
              />
            </div>

            {/* Filtr Kategorii */}
            <div className="relative min-w-[150px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-sm bg-white cursor-pointer"
              >
                <option value="">Wszystkie kategorie</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtr Koloru */}
            <div className="relative min-w-[140px]">
              <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-sm bg-white cursor-pointer capitalize"
              >
                <option value="">Wszystkie kolory</option>
                {allColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Siatka dostępnych ubrań */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1 relative">
          {availableClothes.length === 0 ? (
             <div className="text-center py-16 flex flex-col items-center justify-center">
               <div className="bg-slate-200/50 p-4 rounded-full mb-4">
                 <SearchX className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-700 mb-1">Brak ubrań na podmianę</h3>
               <p className="text-slate-500">Nie masz w szafie innych ubrań, którymi mógłbyś zastąpić ten element.</p>
             </div>
          ) : filteredClothes.length === 0 ? (
             <div className="text-center py-16 flex flex-col items-center justify-center">
               <div className="bg-slate-200/50 p-4 rounded-full mb-4">
                 <SearchX className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-700 mb-1">Nic nie znaleziono</h3>
               <p className="text-slate-500">Brak ubrań spełniających wybrane kryteria filtrowania.</p>
               <button 
                 onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedColor(''); }}
                 className="mt-4 px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors"
               >
                 Wyczyść filtry
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredClothes.map(item => (
                <div key={item.id} className="relative group">
                  <ClothingCard 
                    item={item} 
                    onClick={() => onSwap(item.id)} 
                  />
                  {/* Dekoracyjna, fioletowa ramka przy hoverze, sugerująca akcję podmiany */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400 rounded-2xl pointer-events-none transition-colors duration-200 z-10"></div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}