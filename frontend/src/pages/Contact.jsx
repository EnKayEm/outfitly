import { Code2, Mail, ExternalLink, Users } from 'lucide-react';

const team = [
  {
    name: 'Jakub Kowalski',
    role: 'Frontend & UI/UX',
    email: 'j.kowalski@student.edu.pl',
    github: 'jkowalski',
    linkedin: 'jakub-kowalski',
    avatar: 'JK',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Anna Nowak',
    role: 'Backend & API',
    email: 'a.nowak@student.edu.pl',
    github: 'anowak',
    linkedin: 'anna-nowak',
    avatar: 'AN',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Piotr Wiśniewski',
    role: 'AI / Machine Learning',
    email: 'p.wisniewski@student.edu.pl',
    github: 'pwisniewski',
    linkedin: 'piotr-wisniewski',
    avatar: 'PW',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: 'Marta Zielińska',
    role: 'Bazy danych & DevOps',
    email: 'm.zielinska@student.edu.pl',
    github: 'mzielinska',
    linkedin: 'marta-zielinska',
    avatar: 'MZ',
    color: 'bg-pink-100 text-pink-600',
  },
];

export default function Contact() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">

      {/* Nagłówek */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Kontakt <Users className="text-blue-600 w-6 h-6" />
        </h1>
      </div>

      {/* O projekcie */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">O projekcie</h2>
        <p className="text-slate-600 leading-relaxed">
          <strong>Outfitly</strong> 
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full font-medium">React + Vite</span>
          <span className="px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full font-medium">Django REST Framework</span>
          <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full font-medium">Gemini</span>
          <span className="px-3 py-1 bg-white border border-pink-200 text-pink-700 rounded-full font-medium">Tailwind CSS</span>
        </div>
      </div>

      {/* Zespół */}
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Zespół</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {team.map((member) => (
          <div
            key={member.name}
            className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-sm font-bold shrink-0`}>
              {member.avatar}
            </div>

            {/* Dane */}
            <div>
              <p className="font-semibold text-slate-800">{member.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">{member.role}</p>
            </div>

            {/* Kontakt */}
            <div className="flex flex-col gap-1.5 text-sm">
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Kontakt ogólny */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-800 mb-1">Kontakt ogólny projektu</p>
          <p className="text-sm text-slate-500">Pytania, opinie i zgłoszenia błędów:</p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm">
          <a
            href="mailto:outfitly.projekt@student.edu.pl"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
          >
            <Mail className="w-4 h-4 shrink-0" />
            outfitly.projekt@student.edu.pl
          </a>
          <a
            href="https://github.com/outfitly-team/outfitly"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <Code2 className="w-4 h-4 shrink-0" />
            github.com/outfitly-team/outfitly
          </a>
        </div>
      </div>

    </div>
  );
}
