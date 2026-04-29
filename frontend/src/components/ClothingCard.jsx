export default function ClothingCard({ item, onClick }) {
  // Wyłapujemy i niszczymy puste stringi [""] z backendu
  const validCategories = item.categories 
    ? item.categories.filter(cat => cat && cat.trim() !== '') 
    : [];

  return (
      <div 
        onClick={() => onClick(item.id)}
        className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-200"
      >      
      <div className="aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.description || "Ubranie"}
          className="w-full h-full object-cover"
        />
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
        
        <div className="flex flex-wrap gap-1 mt-2">
          {/* Używamy przefiltrowanej tablicy validCategories */}
          {validCategories.length > 0 ? (
            validCategories.map((cat, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium border border-blue-100">
                {cat}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-medium border border-slate-200">
              Brak kategorii
            </span>
          )}
        </div>
      </div>
    </div>
  );
}