export default function ClothingSkeleton() {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col animate-pulse">
      <div className="aspect-square w-full bg-slate-200"></div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3 mt-2"></div>
      </div>
    </div>
  );
}