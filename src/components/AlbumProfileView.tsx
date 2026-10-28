import React from 'react';
import { ArrowLeft, Play, Shuffle, Plus, Clock } from 'lucide-react';
import { Album, Track } from '../types/music';

interface AlbumProfileViewProps {
  album: Album;
  currentTrack: Track | null;
  isPlaying: boolean;
  onBack: () => void;
  onSelectArtist: (artistId: string) => void;
  onPlayTracksFromAlbum: (tracks: Track[]) => void;
  onPlayAlbum: (album: Album, shuffle?: boolean) => void;
  onAddToQueue: (tracks: Track[]) => void;
}

export const AlbumProfileView: React.FC<AlbumProfileViewProps> = ({
  album,
  currentTrack,
  isPlaying,
  onBack,
  onSelectArtist,
  onPlayTracksFromAlbum,
  onPlayAlbum,
  onAddToQueue,
}) => {
  const tracks = album.tracks || [];

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalMinutes = Math.round(album.duration / 60);

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white overflow-y-auto pb-32">
      {/* Top back navigation */}
      <div className="sticky top-0 z-20 px-6 sm:px-10 py-4 bg-black/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <span className="text-xs text-neutral-500 font-mono">
            Album Details
          </span>
        </div>
      </div>

      {/* Album Header */}
      <div className="px-6 sm:px-10 py-8 flex flex-col md:flex-row items-start md:items-end gap-6 max-w-7xl mx-auto w-full">
        <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl shrink-0 ring-1 ring-white/10">
          <img
            src={album.coverArt}
            alt={album.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Album
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {album.title}
          </h1>

          {/* Linking artist name */}
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span>By</span>
            <button
              type="button"
              onClick={() => onSelectArtist(album.artistId)}
              className="font-medium text-white hover:underline transition-colors cursor-pointer"
            >
              {album.artist}
            </button>
            <span className="text-neutral-600">·</span>
            <span className="font-mono text-neutral-400 text-xs">{album.year}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 text-xs">{album.genre}</span>
          </div>

          <div className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
            <span>{tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}</span>
            <span className="text-neutral-700">·</span>
            <span>{totalMinutes} min</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => onPlayAlbum(album, false)}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Album</span>
            </button>
            <button
              type="button"
              onClick={() => onPlayAlbum(album, true)}
              className="px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium text-xs flex items-center gap-2 hover:bg-neutral-800 hover:text-white transition-colors active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
            <button
              type="button"
              onClick={() => onAddToQueue(tracks)}
              className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Add all to queue"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
        <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 overflow-hidden divide-y divide-neutral-900">
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-2.5 text-xs text-neutral-500 font-mono uppercase tracking-wider">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center">#</span>
              <span>Title</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Tracks */}
          {tracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isSelected = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTracksFromAlbum(tracks.slice(idx))}
                className={`flex items-center justify-between px-4 py-3 hover:bg-neutral-900/60 transition-colors cursor-pointer group ${
                  isSelected ? 'bg-neutral-900/40' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`w-6 text-center text-xs font-mono group-hover:hidden ${
                    isSelected ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                  }`}>
                    {track.trackNumber}
                  </span>
                  <button
                    type="button"
                    className="w-6 h-6 items-center justify-center hidden group-hover:flex text-white"
                    aria-label={`Play ${track.title}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <div className="min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isSelected ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-white'
                    }`}>
                      {track.title}
                    </div>
                    <div className="text-xs text-neutral-500 truncate">
                      {track.artist}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-neutral-500 tabular-nums">
                  <span>{formatDuration(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
