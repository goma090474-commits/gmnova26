'use client';
import { Home, Tv, Film, Clapperboard, Search, Star, Settings } from 'lucide-react';

const menuItems = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'live_tv', icon: Tv, label: 'TV en Vivo' },
  { id: 'movie', icon: Film, label: 'Películas' },
  { id: 'series', icon: Clapperboard, label: 'Series' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'favorites', icon: Star, label: 'Favoritos' },
  { id: 'settings', icon: Settings, label: 'Configuración' },
];

export default function Sidebar({ activeCategory = 'home', onSelectCategory, isSidebarFocused }) {
  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-950/95 backdrop-blur-md border-r border-slate-800/80 transition-all duration-300 z-50 flex flex-col justify-between p-4 ${isSidebarFocused ? 'w-60' : 'w-20'}`}>
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/30">
          Q
        </div>
        {isSidebarFocused && (
          <span className="font-bold text-lg tracking-wider text-white">
            GMNova<span className="text-cyan-400">26</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-2 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory && onSelectCategory(item.id)}
              tabIndex={0}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all outline-none ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/40 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              {isSidebarFocused && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
