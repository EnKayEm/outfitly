import { useState } from 'react';
import { Code2, Users, Building2 } from 'lucide-react';

// Zespół — Wydział Elektrotechniki i Informatyki
const teamEEiI = [
  {
    name: 'Norbert Mazur',
    role: 'Tech Lead & Backend Lead',
    avatar: 'NM',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Bartłomiej Wilk',
    role: 'Database & Backend Developer',
    avatar: 'BW',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Jan Burghardt',
    role: 'Frontend Lead',
    avatar: 'JB',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: 'Wojciech Żurowski',
    role: 'Frontend Developer',
    avatar: 'WZ',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Bartłomiej Zygmunt',
    role: 'Backend Developer',
    avatar: 'BZ',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    name: 'Kamil Wójcik',
    role: 'QA & Documentation',
    avatar: 'KW',
    color: 'bg-indigo-100 text-indigo-600',
  },
];

// Zespół — Wydział Zarządzania
// TODO: uzupełnić danymi członków zespołu.
// Szablon pojedynczego członka (skopiuj i wypełnij):
//   {
//     name: 'Imię Nazwisko',
//     role: 'Rola w zespole',
//     avatar: 'IN',                       // inicjały
//     color: 'bg-blue-100 text-blue-600', // kolor avatara
//   },
const teamManagement = [
  // {
  //   name: '',
  //   role: '',
  //   avatar: '',
  //   color: 'bg-blue-100 text-blue-600',
  // },
];

const tabs = [
  { id: 'eeii', label: 'Wydział Elektrotechniki i Informatyki', team: teamEEiI },
  { id: 'zarzadzanie', label: 'Wydział Zarządzania', team: teamManagement },
];

function TeamGrid({ team }) {
  if (team.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center mb-8">
        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Dane zespołu zostaną dodane wkrótce.</p>
        <p className="text-sm text-slate-400 mt-1">
          Miejsce na członków zespołu z Wydziału Zarządzania.
        </p>
      </div>
    );
  }

  return (
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
        </div>
      ))}
    </div>
  );
}

export default function Contact() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const currentTeam = tabs.find((tab) => tab.id === activeTab)?.team ?? [];

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
          <strong>Outfitly</strong> to aplikacja webowa wspierająca użytkowników w zarządzaniu własną garderobą
            oraz tworzeniu stylizacji. Wykorzystuje sztuczną inteligencję do analizy ubrań i proponowania zestawów
            dopasowanych do okazji. Użytkownik może dodawać ubrania, tworzyć stylizacje oraz zapisywać ulubione kombinacje.
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

      {/* Zakładki wydziałów */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <TeamGrid team={currentTeam} />

      {/* Kontakt ogólny */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800 mb-1">Kontakt ogólny projektu</p>
          <p className="text-sm text-slate-500">Pytania, opinie i zgłoszenia błędów:</p>
        </div>
        <a
          href="https://github.com/EnKayEm/outfitly"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium w-fit shrink-0"
        >
          <Code2 className="w-4 h-4 shrink-0" />
          github.com/EnKayEm/outfitly
        </a>
      </div>

    </div>
  );
}
