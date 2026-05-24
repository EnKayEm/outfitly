import { ShieldCheck } from 'lucide-react';

export default function Deklaracja() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col gap-6">

      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        Deklaracja dostępności <ShieldCheck className="text-blue-600 w-6 h-6" />
      </h1>

      {/* Wstęp */}
      <section>
        <p className="text-slate-600 leading-relaxed">
          Aplikacja <strong>Outfitly</strong> jest projektem studenckim realizowanym w ramach zajęć na uczelni.
          Zobowiązujemy się do zapewnienia dostępności cyfrowej zgodnie z obowiązującymi wytycznymi WCAG 2.1.
          Niniejsza deklaracja dotyczy strony dostępnej pod adresem:{' '}
          <span className="font-medium text-slate-800">[ADRES STRONY]</span>.
        </p>
      </section>

      {/* Stan dostępności */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Stan dostępności cyfrowej</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-slate-700 mb-3">
            Strona jest <strong>częściowo zgodna</strong> z wytycznymi WCAG 2.1. Znane niezgodności:
          </p>
          <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
            <li>Niektóre elementy interaktywne mogą nie być w pełni obsługiwane przez czytniki ekranu.</li>
            <li>Część obrazów może nie posiadać opisów alternatywnych.</li>
            <li>Nawigacja klawiaturą może być ograniczona w niektórych widokach.</li>
          </ul>
        </div>
      </section>

      {/* Data deklaracji */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Przygotowanie deklaracji</h2>
        <div className="text-slate-600 text-sm space-y-1">
          <p><span className="font-medium text-slate-700">Data sporządzenia:</span> 24 maja 2026 r.</p>
          <p><span className="font-medium text-slate-700">Metoda:</span> Samoocena przeprowadzona przez zespół projektowy.</p>
        </div>
      </section>

      {/* Skróty klawiszowe */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Skróty klawiszowe</h2>
        <p className="text-slate-600 text-sm">
          Na stronie można korzystać ze standardowych skrótów klawiszowych przeglądarki.
          Nawigacja między elementami jest możliwa przy użyciu klawisza <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono">Tab</kbd>.
        </p>
      </section>

      {/* Kontakt */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Informacje zwrotne i kontakt</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Wszelkie problemy z dostępnością prosimy zgłaszać na adres e-mail:{' '}
          <a
            href="mailto:outfitly.projekt@student.edu.pl"
            className="text-blue-600 hover:underline font-medium"
          >
            outfitly.projekt@student.edu.pl
          </a>
          . Postaramy się odpowiedzieć możliwie najszybciej.
        </p>
      </section>

    </div>
  );
}
