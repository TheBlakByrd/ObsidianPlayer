import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, ListMusic, Volume2, VolumeX } from 'lucide-react';
import { Track } from '../types/music';

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenNowPlaying: () => void;
  onToggleQueue: () => void;
  onNavigateToArtist: (artistId: string) => void;
  onNavigateToAlbum: (albumId: string) => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenNowPlaying,
  onToggleQueue,
  onNavigateToArtist,
  onNavigateToAlbum,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-900 select-none">
      {/* Top thin progress bar */}
      <div
        onClick={handleProgressBarClick}
        className="w-full h-1 bg-neutral-800 hover:h-1.5 transition-all cursor-pointer relative group"
      >
        <div
          className="h-full bg-white transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Artwork + Track details + Clickable links */}
        <div className="flex items-center gap-3 min-w-0 max-w-[40%] sm:max-w-xs">
          <div
            onClick={onOpenNowPlaying}
            className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0 cursor-pointer group relative shadow-md"
            title="Expand Now Playing"
          >
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.album}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <div
              onClick={onOpenNowPlaying}
              className="text-sm font-semibold text-white hover:text-neutral-200 transition-colors truncate cursor-pointer"
            >
              {currentTrack.title}
            </div>
            <div className="text-xs text-neutral-400 truncate flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigateToArtist(currentTrack.artistId)}
                className="hover:text-white transition-colors hover:underline truncate cursor-pointer"
              >
                {currentTrack.artist}
              </button>
              <span className="text-neutral-600">·</span>
              <button
                type="button"
                onClick={() => onNavigateToAlbum(currentTrack.albumId)}
                className="hover:text-white transition-colors hover:underline truncate cursor-pointer"
              >
                {currentTrack.album}
              </button>
            </div>
          </div>
        </div>

        {/* Center: Play Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={onPrevious}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full active:scale-95"
            title="Previous"
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={onPlayPause}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full active:scale-95"
            title="Next"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right: Volume + Queue + Expand Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Volume slider */}
          <div className="hidden md:flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
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
              className="w-20 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-white"
              aria-label="Volume slider"
            />
          </div>

          {/* Queue toggle */}
          <button
            type="button"
            onClick={onToggleQueue}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg"
            title="Open Queue"
            aria-label="Open Queue"
          >
            <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Expand Now Playing View */}
          <button
            type="button"
            onClick={onOpenNowPlaying}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg flex items-center gap-1.5"
            title="Full Now Playing Screen"
            aria-label="Expand Now Playing"
          >
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
