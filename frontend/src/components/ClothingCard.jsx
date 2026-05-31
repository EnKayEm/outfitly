import { useState } from 'react';
import { Heart } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ClothingCard({ item, onClick, onToggleFavorite, children }) {

  const validCategories = item.categories
    ? item.categories.filter(cat => cat && cat.trim() !== '')
    : [];

  const itemDate = item.creation_date;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={item.description || 'Ubranie'}
      onClick={() => onClick(item.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(item.id)}
      className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-200 h-full"
    >     
      <div className="aspect-square w-full bg-slate-50 overflow-hidden relative">
        <img
          src={item.image_url}
          alt={item.description || "Ubranie"}
          className="w-full h-full object-cover"
        />
        
        {/* Serduszko */}
        <button
          onClick={(e) => {e.stopPropagation();onToggleFavorite(item.id);}}
          title={item.is_favourite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          className={`absolute top-3 left-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border transition-all duration-150 z-10 ${
            item.is_favourite
              ? 'text-pink-500 border-pink-200'
              : 'text-slate-300 border-slate-200 opacity-0 group-hover:opacity-100 hover:text-pink-400 hover:border-pink-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={item.is_favourite ? 'currentColor' : 'none'} />
        </button>

        {/* Odznaka z datą */}
        {itemDate && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md border border-slate-700">
            {formatDate(itemDate)}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 
          className="font-semibold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem]" 
          title={item.description}
        >
          {item.description || "Brak opisu"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Kolor: {item.color || "Nie podano"}
        </p>
        
        {validCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {validCategories.map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium border border-blue-100"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}