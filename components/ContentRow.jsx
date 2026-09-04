'use client';
import { Play } from 'lucide-react';

export default function ContentRow({ title, items = [], isProgressRow = false, onSelect }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 my-8">
      <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect && onSelect(item)}
            tabIndex={0}
            className="flex-none w-44 md:w-52 group cursor-pointer transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-3 bg-cyan-400 text-black rounded-full shadow-lg">
                  <Play className="w-6 h-6 fill-black ml-0.5" />
                </div>
              </div>
            </div>

            {isProgressRow && (
              <div className="w-full bg-slate-800 h-1.5">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${item.progressPercentage || 0}%` }}
                />
              </div>
            )}

            <div className="p-3 bg-slate-900">
              <p className="text-sm font-bold text-white truncate">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
