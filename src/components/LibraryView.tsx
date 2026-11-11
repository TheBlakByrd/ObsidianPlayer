import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Play, Server, Layers, Disc3, Folder, ChevronDown, Check, Shuffle, Music2 } from 'lucide-react';
import { Artist, Genre, Track, MusicFolder } from '../types/music';
import { AlphabetSidebar } from './AlphabetSidebar';

export type LibraryTab = 'artists' | 'genres' | 'songs';

interface LibraryViewProps {
  artists: Artist[];
  genres: Genre[];
  songs?: Track[];
  musicFolders: MusicFolder[];
  selectedMusicFolderId: string;
  onSelectMusicFolder: (folderId: string) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectArtist: (artistId: string) => void;
  onSelectAlbum?: (albumId: string) => void;
  onSelectGenre: (genreName: string) => void;
  onPlayArtist: (artist: Artist) => void;
  onPlaySong?: (track: Track, remainingTracks: Track[]) => void;
  onShuffleAll?: (tracksToShuffle?: Track[]) => void;
  onOpenServerSettings: () => void;
  onOpenDockerGuide: () => void;
  isConnectedToServer: boolean;
  serverName?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  artists,
  genres,
  songs = [],
  musicFolders = [],
  selectedMusicFolderId = 'all',
  onSelectMusicFolder,
  currentTrack,
  isPlaying,
  onSelectArtist,
  onSelectAlbum,
  onSelectGenre,
  onPlayArtist,
  onPlaySong,
  onShuffleAll,
  onOpenServerSettings,
  onOpenDockerGuide,
  isConnectedToServer,
  serverName,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('artists');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string>('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);

  // Close folder dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target as Node)) {
        setIsFolderDropdownOpen(false);
      }
    };
    if (isFolderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFolderDropdownOpen]);

  const selectedFolderName = useMemo(() => {
    const found = musicFolders.find((f) => f.id === selectedMusicFolderId);
    return found ? found.name : 'All Libraries';
  }, [musicFolders, selectedMusicFolderId]);

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

  // Filtered songs
  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  // Group songs by first letter of title for alphabet scrubbing
  const groupedSongs = useMemo(() => {
    const groups: Record<string, Track[]> = {};
    const sorted = [...filteredSongs].sort((a, b) => a.title.localeCompare(b.title));

    for (const song of sorted) {
      const firstChar = song.title.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(song);
    }
    return groups;
  }, [filteredSongs]);

  // Alphabet letters present in the library for the active tab
  const availableLetters = useMemo(() => {
    if (activeTab === 'artists') {
      return Object.keys(groupedArtists).sort((a, b) => (a === '#' ? -1 : a.localeCompare(b)));
    } else if (activeTab === 'genres') {
      const set = new Set<string>();
      filteredGenres.forEach(g => {
        const char = g.name.charAt(0).toUpperCase();
        set.add(/[A-Z]/.test(char) ? char : '#');
      });
      return Array.from(set).sort((a, b) => (a === '#' ? -1 : a.localeCompare(b)));
    } else {
      return Object.keys(groupedSongs).sort((a, b) => (a === '#' ? -1 : a.localeCompare(b)));
    }
  }, [activeTab, groupedArtists, filteredGenres, groupedSongs]);

  const handleSelectLetter = (letter: string) => {
    setActiveLetter(letter);
    const elementId = `letter-section-${letter}`;
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatTotalDuration = (trackList: Track[]): string => {
    const totalSec = trackList.reduce((acc, t) => acc + (t.duration || 0), 0);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Top Navigation & Toolbar */}
      <header className="sticky top-0 z-20 px-6 sm:px-10 py-5 bg-black/90 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Brand title, library switcher & mode info */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
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

            {/* Library / Music Folder Switcher Dropdown */}
            {musicFolders.length > 0 && (
              <div className="relative" ref={folderDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${
                    isFolderDropdownOpen
                      ? 'bg-neutral-800 border-neutral-700 text-white shadow-sm'
                      : 'bg-neutral-900/90 border-neutral-800/90 text-neutral-300 hover:text-white hover:border-neutral-700'
                  }`}
                  title="Switch music library folder"
                  aria-haspopup="listbox"
                  aria-expanded={isFolderDropdownOpen}
                >
                  <Folder className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="max-w-[120px] sm:max-w-[160px] truncate font-normal">
                    {selectedFolderName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 shrink-0 ${
                      isFolderDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isFolderDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Music Libraries"
                    className="absolute left-0 top-full mt-1.5 w-56 rounded-xl bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-neutral-500 border-b border-neutral-900 mb-1">
                      Server Libraries ({musicFolders.length})
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-900/40">
                      {musicFolders.map((folder) => {
                        const isSelected = folder.id === selectedMusicFolderId;
                        return (
                          <button
                            key={folder.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              onSelectMusicFolder(folder.id);
                              setIsFolderDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                              isSelected
                                ? 'text-white bg-white/10 font-medium'
                                : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Folder
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isSelected ? 'text-emerald-400' : 'text-neutral-500'
                                }`}
                              />
                              <span className="truncate">{folder.name}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

            {/* Segmented Choice: Album Artists vs Genres vs Songs */}
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
              <button
                type="button"
                onClick={() => setActiveTab('songs')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'songs'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Songs</span>
              </button>
            </div>

            {/* Quick Shuffle All Button in top toolbar */}
            {onShuffleAll && (
              <button
                type="button"
                onClick={() => onShuffleAll(activeTab === 'songs' ? filteredSongs : songs)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                  activeTab === 'songs'
                    ? 'bg-white text-black border-white hover:bg-neutral-200 font-semibold'
                    : 'bg-neutral-900/90 border-neutral-800/90 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
                title="Shuffle all songs in current library"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle All</span>
              </button>
            )}
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
                placeholder={
                  activeTab === 'artists'
                    ? 'Filter artists...'
                    : activeTab === 'genres'
                    ? 'Filter genres...'
                    : 'Filter songs, artists, albums...'
                }
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

          {/* SONGS VIEW */}
          {activeTab === 'songs' && (
            <div className="space-y-6">
              {/* Songs Header and Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                    <Music2 className="w-5 h-5 text-neutral-400" />
                    <span>Songs</span>
                  </h1>
                  <p className="text-xs text-neutral-500 font-mono mt-1">
                    <span>{filteredSongs.length} {filteredSongs.length === 1 ? 'track' : 'tracks'} in {selectedFolderName}</span>
                    <span className="mx-2 text-neutral-700">·</span>
                    <span>{formatTotalDuration(filteredSongs)}</span>
                  </p>
                </div>

                {/* Prominent Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {onShuffleAll && (
                    <button
                      type="button"
                      onClick={() => onShuffleAll(filteredSongs)}
                      className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Shuffle All ({filteredSongs.length})</span>
                    </button>
                  )}
                  {onPlaySong && filteredSongs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onPlaySong(filteredSongs[0], filteredSongs)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 font-semibold text-xs flex items-center gap-2 hover:bg-neutral-800 hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span>Play In Order</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grouped Songs with Alphabet Anchor Targets */}
              {Object.keys(groupedSongs).length === 0 ? (
                <div className="py-20 text-center text-neutral-500 text-sm">
                  No songs found matching "{searchQuery}"
                </div>
              ) : (
                Object.entries(groupedSongs).map(([letter, letterSongs]) => (
                  <section
                    key={letter}
                    id={`letter-section-${letter}`}
                    className="scroll-mt-24 space-y-1.5"
                  >
                    {/* Letter Subheader */}
                    <div className="flex items-center gap-3 pt-4 pb-2 border-b border-neutral-900/80">
                      <h2 className="text-lg font-bold font-mono tracking-tight text-neutral-400">
                        {letter}
                      </h2>
                      <span className="text-xs text-neutral-600 font-mono">
                        {letterSongs.length} {letterSongs.length === 1 ? 'track' : 'tracks'}
                      </span>
                    </div>

                    {/* Track Rows */}
                    <div className="divide-y divide-neutral-900/40">
                      {letterSongs.map((track) => {
                        const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
                        const isThisTrackActive = currentTrack?.id === track.id;

                        return (
                          <div
                            key={track.id}
                            onClick={() => {
                              if (onPlaySong) {
                                const idx = filteredSongs.findIndex(t => t.id === track.id);
                                const remaining = idx !== -1 ? filteredSongs.slice(idx) : [track];
                                onPlaySong(track, remaining);
                              }
                            }}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                              isThisTrackActive
                                ? 'bg-neutral-900/90 text-white border border-neutral-800/80'
                                : 'hover:bg-neutral-900/50 text-neutral-300 hover:text-white'
                            }`}
                          >
                            {/* Left: Play/Playing Status + Artwork Thumbnail + Info */}
                            <div className="flex items-center gap-3.5 min-w-0 pr-4">
                              {/* Artwork Thumbnail */}
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                                <img
                                  src={track.coverArt || '/default_album.jpg'}
                                  alt={track.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <div
                                  className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                                    isThisTrackPlaying
                                      ? 'opacity-100'
                                      : 'opacity-0 group-hover:opacity-100'
                                  }`}
                                >
                                  {isThisTrackPlaying ? (
                                    <div className="flex items-end gap-0.5 h-3">
                                      <span className="w-0.5 h-3 bg-emerald-400 animate-pulse" />
                                      <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-75" />
                                      <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse delay-150" />
                                    </div>
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current text-white ml-0.5" />
                                  )}
                                </div>
                              </div>

                              {/* Title, Artist, and Album with deep links */}
                              <div className="min-w-0 flex flex-col justify-center">
                                <span
                                  className={`text-xs sm:text-sm font-medium truncate leading-tight ${
                                    isThisTrackActive ? 'text-emerald-400 font-semibold' : 'text-neutral-100 group-hover:text-white'
                                  }`}
                                >
                                  {track.title}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-normal truncate mt-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (track.artistId) onSelectArtist(track.artistId);
                                    }}
                                    className="hover:text-neutral-300 hover:underline truncate"
                                  >
                                    {track.artist}
                                  </button>
                                  <span className="text-neutral-700">·</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (track.albumId && onSelectAlbum) onSelectAlbum(track.albumId);
                                    }}
                                    className="hover:text-neutral-300 hover:underline truncate"
                                  >
                                    {track.album}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Right: Format Tag & Duration */}
                            <div className="flex items-center gap-3 shrink-0">
                              {track.format && (
                                <span className="hidden md:inline-block text-[10px] text-neutral-500 font-mono">
                                  {track.format.split(' ')[0]}
                                </span>
                              )}
                              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                                {Math.floor(track.duration / 60)}:
                                {String(Math.floor(track.duration % 60)).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
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
