import React, { useState, useMemo, useRef } from 'react';
import { Search, Play, Server, Layers, Disc3 } from 'lucide-react';
import { Artist, Genre, Track } from '../types/music';
import { AlphabetSidebar } from './AlphabetSidebar';

export type LibraryTab = 'artists' | 'genres';

interface LibraryViewProps {
  artists: Artist[];
  genres: Genre[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectArtist: (artistId: string) => void;
  onSelectGenre: (genreName: string) => void;
  onPlayArtist: (artist: Artist) => void;
  onOpenServerSettings: () => void;
  onOpenDockerGuide: () => void;
  isConnectedToServer: boolean;
  serverName?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  artists,
  genres,
  currentTrack,
  isPlaying,
  onSelectArtist,
  onSelectGenre,
  onPlayArtist,
  onOpenServerSettings,
  onOpenDockerGuide,
  isConnectedToServer,
  serverName,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('artists');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filtered artists
  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter(a => a.name.toLowerCase().includes(q));
  }, [artists, searchQuery]);

  // Group artists by first letter
  const groupedArtists = useMemo(() => {
    const groups: Record<string, Artist[]> = {};
    const sorted = [...filteredArtists].sort((a, b) => a.name.localeCompare(b.name));

    for (const artist of sorted) {
      const firstChar = artist.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(artist);
    }
    return groups;
  }, [filteredArtists]);

  // Filtered genres
  const filteredGenres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return genres;
    return genres.filter(g => g.name.toLowerCase().includes(q));
  }, [genres, searchQuery]);

  // Alphabet letters present in the library for the active tab
  const availableLetters = useMemo(() => {
    if (activeTab === 'artists') {
      return Object.keys(groupedArtists).sort((a, b) => (a === '#' ? -1 : a.localeCompare(b)));
    } else {
      const set = new Set<string>();
      filteredGenres.forEach(g => {
        const char = g.name.charAt(0).toUpperCase();
        set.add(/[A-Z]/.test(char) ? char : '#');
      });
      return Array.from(set).sort((a, b) => (a === '#' ? -1 : a.localeCompare(b)));
    }
  }, [activeTab, groupedArtists, filteredGenres]);

  const handleSelectLetter = (letter: string) => {
    setActiveLetter(letter);
    const elementId = `letter-section-${letter}`;
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Top Navigation & Toolbar */}
      <header className="sticky top-0 z-20 px-6 sm:px-10 py-5 bg-black/90 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Brand title & mode info */}
          <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
              <Disc3 className="w-4 h-4 text-neutral-200" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white block leading-none">
                Obsidian
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                OpenSubsonic
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

          {/* Segmented Choice: Album Artists vs Genres */}
          <div className="flex items-center p-1 bg-neutral-900/90 rounded-lg border border-neutral-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('artists')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'artists'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Album Artists
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('genres')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'genres'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Genres
            </button>
          </div>
        </div>

        {/* Right: Search + Server / Docker Modals */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'artists' ? 'Filter artists...' : 'Filter genres...'}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-lg pl-9 pr-3 py-2 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Server / Connect Button */}
          <button
            type="button"
            onClick={onOpenServerSettings}
            className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors shrink-0 ${
              isConnectedToServer
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
            title="Navidrome / OpenSubsonic Server settings"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isConnectedToServer ? serverName || 'Connected' : 'Connect Server'}
            </span>
          </button>

          {/* Docker Guide Button */}
          <button
            type="button"
            onClick={onOpenDockerGuide}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors shrink-0 flex items-center gap-1.5"
            title="Docker deployment instructions"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Docker</span>
          </button>
        </div>
        </div>
      </header>

      {/* Main Library Body with Alphabet Sidebar */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 sm:px-10 pr-12 sm:pr-14 py-8 pb-32"
      >
        <div className="max-w-7xl mx-auto w-full">
        {/* ALBUM ARTISTS VIEW */}
        {activeTab === 'artists' && (
          <div className="space-y-10">
            {Object.keys(groupedArtists).length === 0 ? (
              <div className="py-20 text-center text-neutral-500 text-sm">
                No artists found matching "{searchQuery}"
              </div>
            ) : (
              Object.entries(groupedArtists).map(([letter, letterArtists]) => (
                <section
                  key={letter}
                  id={`letter-section-${letter}`}
                  className="scroll-mt-24"
                >
                  {/* Letter Header */}
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-neutral-900">
                    <h2 className="text-xl font-bold font-mono tracking-tight text-neutral-400">
                      {letter}
                    </h2>
                    <span className="text-xs text-neutral-600 font-mono">
                      {letterArtists.length} {letterArtists.length === 1 ? 'artist' : 'artists'}
                    </span>
                  </div>

                  {/* Artists Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {letterArtists.map((artist) => {
                      const isThisArtistPlaying = currentTrack?.artistId === artist.id && isPlaying;

                      return (
                        <div
                          key={artist.id}
                          onClick={() => onSelectArtist(artist.id)}
                          className="group relative cursor-pointer flex flex-col items-start select-none"
                        >
                          {/* Artist Avatar / Artwork */}
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/80 mb-3 shadow-md group-hover:border-neutral-700 transition-all duration-300">
                            <img
                              src={artist.coverArt}
                              alt={artist.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Quick Play Overlay Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlayArtist(artist);
                              }}
                              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all duration-200 ${
                                isThisArtistPlaying
                                  ? 'opacity-100 scale-100'
                                  : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95'
                              }`}
                              title={`Play ${artist.name}`}
                              aria-label={`Play ${artist.name}`}
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          </div>

                          {/* Artist Name */}
                          <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors truncate w-full">
                            {artist.name}
                          </h3>

                          {/* Unboxed Metadata per Zero-Pill discipline */}
                          <p className="text-xs text-neutral-500 mt-0.5 truncate w-full">
                            <span>{artist.albumCount} {artist.albumCount === 1 ? 'album' : 'albums'}</span>
                            <span className="mx-1.5 text-neutral-700">·</span>
                            <span>{artist.trackCount} tracks</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {/* GENRES VIEW */}
        {activeTab === 'genres' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredGenres.map((genre) => (
                <div
                  key={genre.name}
                  onClick={() => onSelectGenre(genre.name)}
                  className="group relative cursor-pointer p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between min-h-[140px] overflow-hidden"
                >
                  {/* Subtle color aura indicator */}
                  <div
                    className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-35 transition-opacity duration-500"
                    style={{ backgroundColor: genre.accentColor }}
                  />

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-neutral-100 transition-colors">
                      {genre.name}
                    </h3>
                  </div>

                  {/* Clean unboxed stats */}
                  <div className="text-xs text-neutral-400 flex items-center gap-1.5 pt-4">
                    <span>{genre.albumCount} {genre.albumCount === 1 ? 'album' : 'albums'}</span>
                    <span className="text-neutral-600">·</span>
                    <span>{genre.songCount} {genre.songCount === 1 ? 'track' : 'tracks'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Alphabet Scrubber Sidebar */}
      <AlphabetSidebar
        availableLetters={availableLetters}
        activeLetter={activeLetter}
        onSelectLetter={handleSelectLetter}
      />
    </div>
  );
};
