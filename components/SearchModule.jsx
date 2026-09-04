'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchModule({ items = [], onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = items.filter((item) =>
    item.title?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar películas, series o canales..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-lg shadow-inner"
        />
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-300 mb-4">
          {query ? `Resultados para "${query}" (${filtered.length})` : 'Catálogo Disponible'}
        </h3>

        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No se encontraron resultados para tu búsqueda.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect && onSelect(item)}
                tabIndex={0}
                className="relative group cursor-pointer transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
              >
                <div className="w-full h-64 overflow-hidden">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <div className="p-3 bg-slate-900/90">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
