import { useState, useEffect } from 'react';
import { X, ArrowLeftRight, SearchX, Search, Filter, Palette, Check, PlusCircle } from 'lucide-react';
import ClothingCard from './ClothingCard';

  const FancyCheckPurple = ({ isChecked }) => (
    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center shrink-0 ${
      isChecked 
        ? 'bg-purple-600 border-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.3)]' 
        : 'bg-white border-slate-300 group-hover:border-slate-400'
    }`}>
      {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />}
    </div>
  );

export default function SwapClothingModal({ isOpen, onClose, clothes, currentOutfitIds, onSwap, mode = 'swap' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategories([]);
      setSelectedColors([]);
      setIsCategoryDropdownOpen(false);
      setIsColorDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableClothes = clothes.filter(c => c?.id && !currentOutfitIds.some(id => String(id) === String(c.id)));

  const allCategories = [...new Set(availableClothes.flatMap(c => c.categories || []))]
    .filter(cat => cat && cat.trim() !== '')
    .sort();
  const allColors = [...new Set(availableClothes.map(c => c.color))]
    .filter(color => color && color.trim() !== '')
    .sort();

  const filteredClothes = availableClothes.filter(item => {
    const matchesSearch = (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
      (item.categories && item.categories.some(cat => selectedCategories.includes(cat)));
    const matchesColor = selectedColors.length === 0 || 
      (item.color && selectedColors.includes(item.color));
    
    return matchesSearch && matchesCategory && matchesColor;
  });

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {(isCategoryDropdownOpen || isColorDropdownOpen) && (
          <div className="fixed inset-0 z-10" onClick={() => { setIsCategoryDropdownOpen(false); setIsColorDropdownOpen(false); }}></div>
        )}

        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0 z-20 relative">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {mode === 'swap' ? (
              <>
                <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                Wybierz ubranie na podmianę
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-purple-600" />
                Wybierz ubranie do dodania
              </>
            )}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 border border-slate-200 p-2 rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-3 shrink-0 shadow-sm z-20 relative">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj po nazwie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-shadow shadow-inner"
            />
          </div>

          {/* Dropdown Kategorii  */}
          <div className="relative min-w-[190px]">
            <button 
              onClick={() => { setIsCategoryDropdownOpen(!isCategoryDropdownOpen); setIsColorDropdownOpen(false); }}
              className={`w-full flex items-center justify-between pl-3 pr-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${selectedCategories.length > 0 ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {selectedCategories.length > 0 ? `Kategorie (${selectedCategories.length})` : 'Wszystkie kategorie'}
              </span>
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-2.5 z-30 animate-in slide-in-from-top-2">
                {allCategories.map(cat => (
                  <label key={cat} className="group flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors">
                    <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                    <FancyCheckPurple isChecked={selectedCategories.includes(cat)} />
                    <span className="truncate font-medium">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Kolorów */}
          <div className="relative min-w-[180px]">
            <button 
              onClick={() => { setIsColorDropdownOpen(!isColorDropdownOpen); setIsCategoryDropdownOpen(false); }}
              className={`w-full flex items-center justify-between pl-3 pr-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${selectedColors.length > 0 ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {selectedColors.length > 0 ? `Kolory (${selectedColors.length})` : 'Wszystkie kolory'}
              </span>
            </button>
            
            {isColorDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-2.5 z-30 animate-in slide-in-from-top-2">
                {allColors.map(color => (
                  <label key={color} className="group flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors capitalize">
                    <input type="checkbox" className="hidden" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} />
                    <FancyCheckPurple isChecked={selectedColors.includes(color)} />
                    <span className="truncate font-medium">{color}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Siatka ubrań */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1 relative z-0">
          {filteredClothes.length === 0 ? (
             <div className="text-center py-16 flex flex-col items-center">
               <div className="bg-slate-200/50 p-4 rounded-full mb-4"><SearchX className="w-10 h-10 text-slate-400" /></div>
               <h3 className="text-lg font-bold text-slate-700 mb-1">Nic nie znaleziono</h3>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredClothes.map(item => (
                <div key={item.id} className="relative group cursor-pointer h-full" onClick={() => onSwap(item.id)}>
                  <div className="absolute -inset-1 rounded-2xl border-4 border-transparent group-hover:border-purple-500 group-hover:bg-purple-500/5 transition-all duration-200 z-10 group-hover:-translate-y-1 shadow-purple-100 group-hover:shadow-xl group-hover:shadow-purple-200/50"></div>
                  
                  <div className="relative group-hover:-translate-y-1 transition-transform duration-200 ease-out z-0 h-full">
                    <div className="pointer-events-none h-full">
                      <ClothingCard item={item} onClick={() => {}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}   