export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Logowanie</h1>
        <p className="text-slate-500 mb-6">Witaj w Outfitly!</p>
        
        <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
          Zaloguj się (Zaślepka)
        </button>
      </div>
    </div>
  );
}