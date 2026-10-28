import React from 'react';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import { Artist, Track } from '../types/music';

interface ArtistProfileViewProps {
  artist: Artist;
  currentTrack: Track | null;
  isPlaying: boolean;
  onBack: () => void;
  onSelectAlbum: (albumId: string) => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[], shuffle?: boolean) => void;
}

export const ArtistProfileView: React.FC<ArtistProfileViewProps> = ({
  artist,
  currentTrack,
  isPlaying,
  onBack,
  onSelectAlbum,
  onPlayTrack,
  onPlayAll,
}) => {
  // Extract all tracks from artist's albums
  const allTracks: Track[] = (artist.albums || []).flatMap((alb) => alb.tracks || []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
            <span>Back to Library</span>
          </button>

          <span className="text-xs text-neutral-500 font-mono">
            Artist Profile
          </span>
        </div>
      </div>

      {/* Artist Hero Banner */}
      <div className="px-6 sm:px-10 py-8 flex flex-col md:flex-row items-start md:items-end gap-6 max-w-7xl mx-auto w-full">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl shrink-0">
          <img
            src={artist.coverArt}
            alt={artist.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Album Artist
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {artist.name}
          </h1>

          {artist.bio && (
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {artist.bio}
            </p>
          )}

          {/* Unboxed metadata */}
          <div className="text-xs text-neutral-500 flex items-center gap-2 pt-1 font-mono">
            <span>{artist.albumCount} {artist.albumCount === 1 ? 'Album' : 'Albums'}</span>
            <span className="text-neutral-700">·</span>
            <span>{artist.trackCount} Tracks</span>
            {artist.genres.length > 0 && (
              <>
                <span className="text-neutral-700">·</span>
                <span>{artist.genres.join(', ')}</span>
              </>
            )}
          </div>

          {/* Play & Shuffle buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onPlayAll(allTracks, false)}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Artist</span>
            </button>
            <button
              type="button"
              onClick={() => onPlayAll(allTracks, true)}
              className="px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium text-xs flex items-center gap-2 hover:bg-neutral-800 hover:text-white transition-colors active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full space-y-10">
        {/* Discography / Albums */}
        <section>
          <h2 className="text-base font-semibold text-white mb-4">
            Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {(artist.albums || []).map((album) => (
              <div
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className="group cursor-pointer select-none"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-2.5 shadow-md group-hover:border-neutral-700 transition-colors">
                  <img
                    src={album.coverArt}
                    alt={album.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white transition-colors truncate">
                  {album.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                  {album.year} · {album.songCount} {album.songCount === 1 ? 'track' : 'tracks'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks List */}
        {allTracks.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-white mb-4">
              Tracks
            </h2>
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 overflow-hidden divide-y divide-neutral-900">
              {allTracks.map((track, idx) => {
                const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
                const isSelected = currentTrack?.id === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track)}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-neutral-900/60 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-neutral-900/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-6 text-center text-xs font-mono text-neutral-500 group-hover:hidden">
                        {idx + 1}
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
                          {track.album}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-neutral-500 tabular-nums">
                      <span>{formatTime(track.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
