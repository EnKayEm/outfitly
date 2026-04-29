import { X, ArrowLeftRight, SearchX } from 'lucide-react';
import ClothingCard from './ClothingCard';


export default function SwapClothingModal({ isOpen, onClose, clothes, currentOutfitIds, onSwap }) {
  if (!isOpen) return null;

  // Filtrujemy ubrania - nie pokazujemy tych, które już są w obecnej stylizacji
  const availableClothes = clothes.filter(c => !currentOutfitIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Nagłówek Modala */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
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
        
        {/* Siatka dostępnych ubrań */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          {availableClothes.length === 0 ? (
             <div className="text-center py-16 flex flex-col items-center justify-center">
               <div className="bg-slate-200/50 p-4 rounded-full mb-4">
                 <SearchX className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-700 mb-1">Brak ubrań na podmianę</h3>
               <p className="text-slate-500">Nie masz w szafie innych ubrań, którymi mógłbyś zastąpić ten element.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableClothes.map(item => (
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