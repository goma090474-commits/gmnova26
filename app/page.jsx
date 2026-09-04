'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import Player from '@/components/Player';
import SearchModule from '@/components/SearchModule';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('home');
  const [activeStream, setActiveStream] = useState(null);
  const [heroBanner, setHeroBanner] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: bannerData } = await supabase
        .from('hero_banners')
        .select('*, media_items(*)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (bannerData && bannerData.media_items) {
        setHeroBanner({
          mediaId: bannerData.media_items.id,
          title: bannerData.custom_title || bannerData.media_items.title,
          description: bannerData.custom_description || bannerData.media_items.description,
          genres: bannerData.media_items.genres || ['General'],
          year: bannerData.media_items.release_year,
          duration: `${bannerData.media_items.duration_min || 120}m`,
          backdropUrl: bannerData.custom_backdrop || bannerData.media_items.backdrop_url,
          streamUrl: bannerData.media_items.stream_url
        });
      }

      const { data: historyData } = await supabase
        .from('playback_history')
        .select('*, media_items(*)')
        .gt('last_position_sec', 0)
        .order('updated_at', { ascending: false });

      if (historyData) {
        const formattedContinue = historyData
          .filter((item) => item.media_items && item.media_items.is_active)
          .map((item) => ({
            id: item.media_items.id,
            title: item.media_items.title,
            posterUrl: item.media_items.poster_url,
            streamUrl: item.media_items.stream_url,
            lastPositionSec: item.last_position_sec,
            progressPercentage: Math.min(
              Math.round((item.last_position_sec / item.total_duration_sec) * 100),
              100
            )
          }));
        setContinueWatching(formattedContinue);
      }

      const { data: items } = await supabase
        .from('media_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (items) {
        const formatted = items.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          posterUrl: item.poster_url,
          streamUrl: item.stream_url,
          genres: item.genres || []
        }));
        setAllItems(formatted);
      }
    } catch (err) {
      console.error('Error cargando contenidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePlayer = () => {
    setActiveStream(null);
    fetchData();
  };

  const movies = allItems.filter((i) => i.type === 'movie');
  const series = allItems.filter((i) => i.type === 'series');
  const liveTv = allItems.filter((i) => i.type === 'live_tv');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold text-xl">
        Cargando GMNova26...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex">
      {activeStream ? (
        <Player
          mediaId={activeStream.mediaId}
          streamUrl={activeStream.url}
          title={activeStream.title}
          initialTime={activeStream.initialTime || 0}
          onBack={handleClosePlayer}
        />
      ) : (
        <>
          <Sidebar
            activeCategory={activeCategory}
            onSelectCategory={(category) => setActiveCategory(category)}
            isSidebarFocused={false}
          />

          <div className="flex-1 pl-24 pr-8 py-8 transition-all duration-300">
            {activeCategory === 'home' && (
              <>
                {heroBanner && (
                  <HeroBanner
                    bannerData={heroBanner}
                    onPlay={() =>
                      setActiveStream({
                        mediaId: heroBanner.mediaId,
                        url: heroBanner.streamUrl,
                        title: heroBanner.title,
                        initialTime: 0
                      })
                    }
                  />
                )}

                {continueWatching.length > 0 && (
                  <ContentRow
                    title="CONTINUAR VIENDO"
                    items={continueWatching}
                    isProgressRow={true}
                    onSelect={(item) =>
                      setActiveStream({
                        mediaId: item.id,
                        url: item.streamUrl,
                        title: item.title,
                        initialTime: item.lastPositionSec
                      })
                    }
                  />
                )}

                {allItems.length > 0 && (
                  <ContentRow
                    title="ESTRENOS RECIENTES"
                    items={allItems}
                    onSelect={(item) =>
                      setActiveStream({
                        mediaId: item.id,
                        url: item.streamUrl,
                        title: item.title,
                        initialTime: 0
                      })
                    }
                  />
                )}
              </>
            )}

            {activeCategory === 'movie' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white border-b border-slate-800 pb-4">🎬 Películas</h1>
                <ContentRow
                  title="CATÁLOGO COMPLETO DE PELÍCULAS"
                  items={movies}
                  onSelect={(item) =>
                    setActiveStream({ mediaId: item.id, url: item.streamUrl, title: item.title, initialTime: 0 })
                  }
                />
              </div>
            )}

            {activeCategory === 'series' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white border-b border-slate-800 pb-4">📺 Series</h1>
                <ContentRow
                  title="CATÁLOGO DE SERIES"
                  items={series}
                  onSelect={(item) =>
                    setActiveStream({ mediaId: item.id, url: item.streamUrl, title: item.title, initialTime: 0 })
                  }
                />
              </div>
            )}

            {activeCategory === 'live_tv' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white border-b border-slate-800 pb-4">📡 TV en Vivo</h1>
                <ContentRow
                  title="CANALES DESTACADOS"
                  items={liveTv}
                  onSelect={(item) =>
                    setActiveStream({ mediaId: item.id, url: item.streamUrl, title: item.title, initialTime: 0 })
                  }
                />
              </div>
            )}

            {activeCategory === 'search' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white border-b border-slate-800 pb-4">🔎 Búsqueda</h1>
                <SearchModule
                  items={allItems}
                  onSelect={(item) =>
                    setActiveStream({ mediaId: item.id, url: item.streamUrl, title: item.title, initialTime: 0 })
                  }
                />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
