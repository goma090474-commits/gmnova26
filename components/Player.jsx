'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, ArrowLeft, Volume2, VolumeX, Maximize, RotateCcw, RotateCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Player({ mediaId, streamUrl, title, initialTime = 0, onBack }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('00:00');
  const [durationFormatted, setDurationFormatted] = useState('00:00');
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timer;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const saveProgress = async (currentSec, totalSec) => {
    if (!mediaId || !currentSec || !totalSec || totalSec <= 0) return;
    const finalSec = (currentSec / totalSec) >= 0.95 ? 0 : Math.floor(currentSec);

    try {
      await supabase.from('playback_history').upsert(
        {
          user_id: '00000000-0000-0000-0000-000000000001',
          media_id: mediaId,
          last_position_sec: finalSec,
          total_duration_sec: Math.floor(totalSec),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, media_id' }
      );
    } catch (err) {
      console.error('Error al guardar progreso:', err);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls;

    const setPlaybackPosition = () => {
      if (initialTime > 0 && Math.abs(video.currentTime - initialTime) > 2) {
        video.currentTime = initialTime;
      }
    };

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlaybackPosition();
        video.play().catch(() => setIsPlaying(false));
      });
    } else {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', setPlaybackPosition);
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl, initialTime]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const total = video.duration || 1;

    setProgress((current / total) * 100);
    setCurrentTimeFormatted(formatTime(current));
    setDurationFormatted(formatTime(total));

    if (Math.floor(current) % 10 === 0 && Math.floor(current) > 0) {
      saveProgress(current, total);
    }
  };

  const formatTime = (sec) => {
    if (isNaN(sec) || sec < 0) return '00:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const pad = (num) => (num < 10 ? `0${num}` : num);
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      saveProgress(video.currentTime, video.duration);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      setVolume(val);
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const targetPercent = parseFloat(e.target.value);
    const newTime = (targetPercent / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(targetPercent);
    saveProgress(newTime, video.duration);
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
    saveProgress(video.currentTime, video.duration);
  };

  const handleBack = () => {
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
    onBack();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden select-none">
      <video ref={videoRef} className="w-full h-full object-contain cursor-pointer" onTimeUpdate={handleTimeUpdate} onClick={togglePlay} autoPlay />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/70 flex flex-col justify-between p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-3 bg-slate-800/80 hover:bg-cyan-500 rounded-full text-white transition-all outline-none">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white tracking-wide truncate">{title || 'Reproduciendo contenido'}</h2>
        </div>
        <div className="space-y-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-mono w-14 text-right">{currentTimeFormatted}</span>
            <input type="range" min="0" max="100" step="0.1" value={progress} onChange={handleSeek} className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none" />
            <span className="text-xs text-slate-300 font-mono w-14">{durationFormatted}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => skipTime(-10)} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all outline-none">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button onClick={togglePlay} className="p-3 bg-cyan-400 text-black hover:bg-cyan-300 rounded-xl transition-all outline-none">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-black" />}
              </button>
              <button onClick={() => skipTime(10)} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all outline-none">
                <RotateCw className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={toggleMute} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all outline-none">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
              </div>
            </div>
            <button onClick={toggleFullScreen} className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all outline-none">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
