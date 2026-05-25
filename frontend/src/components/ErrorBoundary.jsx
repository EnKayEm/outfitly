import { Component } from 'react';
import { ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg w-full p-8 flex flex-col gap-6">

          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
            <h1 className="text-xl font-bold text-slate-800">Coś poszło nie tak</h1>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
            <p className="font-semibold mb-1">Używasz blokera reklam?</p>
            <p>
              Brave Shields i inne blokery mogą blokować pliki cookie oraz zapytania do API,
              co powoduje błędy aplikacji. Wyłącz blokera dla tej strony i odśwież.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Odśwież stronę
          </button>

          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer hover:text-slate-600 transition-colors select-none">
              Szczegóły błędu
            </summary>
            <pre className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-all text-slate-600">
              {this.state.error.toString()}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </details>

        </div>
      </div>
    );
  }
}
