'use client';
import { Play, Info } from 'lucide-react';

export default function HeroBanner({ bannerData, onPlay }) {
  if (!bannerData) return null;

  return (
    <div className="relative w-full h-[480px] rounded-3xl overflow-hidden mb-8 group border border-slate-800">
      <img
        src={bannerData.backdropUrl}
        alt={bannerData.title}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

      <div className="absolute bottom-0 left-0 p-8 max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Destacado
          </span>
          <span className="text-sm font-semibold text-slate-300">{bannerData.year}</span>
          <span className="text-sm font-semibold text-slate-300">{bannerData.duration}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          {bannerData.title}
        </h1>

        <p className="text-sm md:text-base text-slate-300 line-clamp-3 leading-relaxed">
          {bannerData.description}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onPlay}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Play className="w-5 h-5 fill-black" /> Reproducir
          </button>
        </div>
      </div>
    </div>
  );
}
