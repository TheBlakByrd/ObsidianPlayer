import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Track, RepeatMode } from '../types/music';
import { extractDominantColor, ColorPalette } from '../services/colorExtractor';

interface NowPlayingViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onMinimize: () => void;
  onToggleQueue: () => void;
  onNavigateToArtist: (artistId: string) => void;
  onNavigateToAlbum: (albumId: string) => void;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onMinimize,
  onToggleQueue,
  onNavigateToArtist,
  onNavigateToAlbum,
}) => {
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayedCoverArt, setDisplayedCoverArt] = useState<string>(currentTrack?.coverArt || '');

  // Keep album cover art continuous and persistent across songs of the same album
  useEffect(() => {
    if (!currentTrack) return;
    if (currentTrack.coverArt && currentTrack.coverArt.trim() !== '') {
      setDisplayedCoverArt(currentTrack.coverArt);
    }
  }, [currentTrack?.id, currentTrack?.coverArt, currentTrack?.albumId]);

  // Smooth dynamic color sampling when track or cover changes
  useEffect(() => {
    let isMounted = true;
    const effectiveArt = currentTrack?.coverArt || displayedCoverArt;
    if (effectiveArt) {
      extractDominantColor(effectiveArt).then((extracted) => {
        if (isMounted) {
          setPalette(extracted);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentTrack?.coverArt, currentTrack?.id, displayedCoverArt]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeDisplayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? (activeDisplayTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubTime(val);
  };

  const handleSeekCommit = () => {
    setIsScrubbing(false);
    onSeek(scrubTime);
  };

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!currentTrack) {
    return (
      <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center p-6 text-neutral-400">
        <button
          onClick={onMinimize}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="Back to library"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <p className="text-sm font-medium">No track currently playing</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Dynamic blurred dominant color background layer - smoothly transitions */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: palette?.gradientCss || 'radial-gradient(circle at 50% 30%, rgba(30,35,45,0.4) 0%, #000000 85%)',
          opacity: 0.92,
        }}
      />

      {/* Secondary ambient glow anchor right behind the artwork for depth */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none transition-colors duration-1000 ease-out blur-[120px]"
        style={{
          backgroundColor: palette?.ambientGlow || 'rgba(255,255,255,0.05)',
        }}
      />

      {/* Minimal Top Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
        <button
          type="button"
          onClick={onMinimize}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors backdrop-blur-md"
          title="Minimize to library"
          aria-label="Minimize now playing"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Small subtle audio specs */}
        <div className="text-xs text-neutral-400/80 font-mono tracking-wider tabular-nums">
          {currentTrack.format || 'Hi-Res Audio'}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreenMode}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors hidden sm:flex"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleQueue}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Queue"
            aria-label="Open queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Center Content: Big Album Art + Minimal Metadata */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-xl mx-auto w-full min-h-0 my-auto py-2">
        {/* Big Album Art in the Center - responsive max-height to guarantee text is always visible */}
        <div className="relative group w-auto max-w-[320px] sm:max-w-[380px] md:max-w-[420px] aspect-square max-h-[38vh] sm:max-h-[44vh] mx-auto mb-4 sm:mb-6 shrink">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-transform duration-500 ease-out">
            <img
              src={currentTrack.coverArt || displayedCoverArt}
              alt={currentTrack.album || currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />
          </div>
        </div>

        {/* Track Title - Crisp white text */}
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white text-center line-clamp-1 max-w-md sm:max-w-lg mb-1 sm:mb-1.5 px-2">
          {currentTrack.title}
        </h1>

        {/* Artist and Album Name - In a smaller and somewhat darker font than the song title */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400 font-medium max-w-md sm:max-w-lg text-center px-2">
          <button
            type="button"
            onClick={() => onNavigateToArtist(currentTrack.artistId)}
            className="text-neutral-400 hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
            title={`View artist: ${currentTrack.artist}`}
          >
            {currentTrack.artist || 'Unknown Artist'}
          </button>
          <span className="text-neutral-600 select-none" aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onNavigateToAlbum(currentTrack.albumId)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors underline-offset-4 hover:underline cursor-pointer font-normal"
            title={`View album: ${currentTrack.album}`}
          >
            {currentTrack.album || 'Unknown Album'}
          </button>
        </div>
      </main>

      {/* Bottom Area: Progress Bar + Play Controls */}
      <footer className="relative z-10 px-6 sm:px-10 pb-6 sm:pb-10 max-w-xl mx-auto w-full flex flex-col gap-4 sm:gap-5 shrink-0">
        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="relative group w-full h-2 flex items-center cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={activeDisplayTime}
              onMouseDown={() => setIsScrubbing(true)}
              onTouchStart={() => setIsScrubbing(true)}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              aria-label="Track progress"
            />
            {/* Background track */}
            <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-white/20 transition-all overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timers */}
          <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 tabular-nums">
            <span>{formatTime(activeDisplayTime)}</span>
            <span>-{formatTime(Math.max(0, duration - activeDisplayTime))}</span>
          </div>
        </div>

        {/* Play Controls Below */}
        <div className="flex items-center justify-between sm:justify-center sm:gap-8 pt-1">
          {/* Shuffle */}
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white'
            }`}
            title={isShuffle ? 'Shuffle enabled' : 'Shuffle off'}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Previous Track */}
          <button
            type="button"
            onClick={onPrevious}
            className="p-2.5 rounded-full text-neutral-300 hover:text-white transition-all active:scale-95"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Play / Pause - Large minimal button */}
          <button
            type="button"
            onClick={onPlayPause}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/60"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            type="button"
            onClick={onNext}
            className="p-2.5 rounded-full text-neutral-300 hover:text-white transition-all active:scale-95"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-full relative transition-colors ${
              repeatMode !== 'off' ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
            aria-label="Repeat"
          >
            <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[9px] font-mono font-bold bg-white text-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* Minimal Volume Control */}
        <div className="flex items-center justify-center gap-3 pt-2 max-w-xs mx-auto w-full opacity-70 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onToggleMute}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24 sm:w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            aria-label="Volume slider"
          />
        </div>
      </footer>
    </div>
  );
};
