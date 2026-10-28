import React from 'react';
import { ArrowLeft, Play, Disc } from 'lucide-react';
import { Album, Track } from '../types/music';

interface GenreDetailViewProps {
  genreName: string;
  albums: Album[];
  tracks: Track[];
  onBack: () => void;
  onSelectAlbum: (albumId: string) => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
}

export const GenreDetailView: React.FC<GenreDetailViewProps> = ({
  genreName,
  albums,
  tracks,
  onBack,
  onSelectAlbum,
  onPlayTrack,
  onPlayAll,
}) => {
  const filteredAlbums = albums.filter(a => a.genre.toLowerCase() === genreName.toLowerCase());
  const filteredTracks = tracks.filter(t => t.genre?.toLowerCase() === genreName.toLowerCase());

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
            Genre Collection
          </span>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
            Genre
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {genreName}
          </h1>
          <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 pt-1">
            <span>{filteredAlbums.length} {filteredAlbums.length === 1 ? 'Album' : 'Albums'}</span>
            <span className="text-neutral-700">·</span>
            <span>{filteredTracks.length} Tracks</span>
          </div>

          {filteredTracks.length > 0 && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onPlayAll(filteredTracks)}
                className="px-5 py-2 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Genre</span>
              </button>
            </div>
          )}
        </div>

        {/* Albums under this genre */}
        {filteredAlbums.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-white mb-4">
              Albums in {genreName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => onSelectAlbum(alb.id)}
                  className="group cursor-pointer select-none"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-2.5 shadow-md group-hover:border-neutral-700 transition-colors">
                    <img
                      src={alb.coverArt}
                      alt={alb.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white transition-colors truncate">
                    {alb.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    {alb.artist}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tracks under this genre */}
        {filteredTracks.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-white mb-4">
              Tracks in {genreName}
            </h2>
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 overflow-hidden divide-y divide-neutral-900">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-neutral-900/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                      <img
                        src={track.coverArt}
                        alt={track.album}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-neutral-100 group-hover:text-white truncate">
                        {track.title}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        {track.artist} · {track.album}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-neutral-500 tabular-nums shrink-0">
                    {formatTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
