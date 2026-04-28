export default function ClothingCard({ item }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
      {/* Kontener na zdjęcie wymusza proporcje 1:1, żeby grid nie wyglądał jak schody */}
      <div className="aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.description || "Ubranie"}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-800 text-lg truncate" title={item.description}>
          {item.description || "Brak opisu"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Kolor: {item.color || "Nie podano"}
        </p>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {item.categories && item.categories.length > 0 ? (
            item.categories.map((cat, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {cat}
              </span>
            ))
          ) : (
            <span className="text-xs bg-red-50 text-red-400 px-2 py-1 rounded-full border border-red-100">
              Brak kategorii
            </span>
          )}
        </div>
      </div>
    </div>
  );
}