import React, { useState, useEffect, useCallback } from 'react';
import { Artist, Album, Track, Genre, RepeatMode } from './types/music';
import { subsonicService } from './services/subsonic';
import { audioEngine } from './services/audioEngine';
import { LibraryView } from './components/LibraryView';
import { NowPlayingView } from './components/NowPlayingView';
import { ArtistProfileView } from './components/ArtistProfileView';
import { AlbumProfileView } from './components/AlbumProfileView';
import { GenreDetailView } from './components/GenreDetailView';
import { MiniPlayer } from './components/MiniPlayer';
import { QueueDrawer } from './components/QueueDrawer';
import { ServerSettingsModal } from './components/ServerSettingsModal';
import { DockerGuideModal } from './components/DockerGuideModal';

type AppView = 'library' | 'artist' | 'album' | 'genre';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedGenreName, setSelectedGenreName] = useState<string | null>(null);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [isDockerGuideOpen, setIsDockerGuideOpen] = useState(false);

  // Library Data State
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [serverConfig, setServerConfig] = useState(subsonicService.getConfig());

  // Detailed selected objects
  const [activeArtistObj, setActiveArtistObj] = useState<Artist | null>(null);
  const [activeAlbumObj, setActiveAlbumObj] = useState<Album | null>(null);

  // Playback & Queue State
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');

  const currentTrack: Track | null = queue[currentIndex] || null;

  // Load Library Data
  const loadLibrary = useCallback(async () => {
    const fetchedArtists = await subsonicService.getArtists();
    const fetchedGenres = await subsonicService.getGenres();
    const fetchedAlbums = await subsonicService.getAllAlbums();

    setArtists(fetchedArtists);
    setGenres(fetchedGenres);
    setAlbums(fetchedAlbums);
    setServerConfig(subsonicService.getConfig());
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Handle selected artist change
  useEffect(() => {
    if (selectedArtistId) {
      subsonicService.getArtist(selectedArtistId).then((art) => {
        setActiveArtistObj(art);
      });
    } else {
      setActiveArtistObj(null);
    }
  }, [selectedArtistId]);

  // Handle selected album change
  useEffect(() => {
    if (selectedAlbumId) {
      subsonicService.getAlbum(selectedAlbumId).then((alb) => {
        setActiveAlbumObj(alb);
      });
    } else {
      setActiveAlbumObj(null);
    }
  }, [selectedAlbumId]);

  // Audio Engine Callbacks
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.playTrack(currentTrack.audioUrl, currentTrack.duration, 0);
      return;
    }

    if (queue.length === 0) return;

    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * queue.length);
      setCurrentIndex(nextIdx);
      const nextTrack = queue[nextIdx];
      audioEngine.playTrack(nextTrack.audioUrl, nextTrack.duration, 0);
      setIsPlaying(true);
      return;
    }

    if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextTrack = queue[nextIdx];
      if ((!nextTrack.coverArt || nextTrack.coverArt === '') && currentTrack?.coverArt && nextTrack.albumId === currentTrack.albumId) {
        nextTrack.coverArt = currentTrack.coverArt;
      }
      setCurrentIndex(nextIdx);
      audioEngine.playTrack(nextTrack.audioUrl, nextTrack.duration, 0);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setCurrentIndex(0);
      const nextTrack = queue[0];
      audioEngine.playTrack(nextTrack.audioUrl, nextTrack.duration, 0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [queue, currentIndex, repeatMode, isShuffle, currentTrack]);

  useEffect(() => {
    audioEngine.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        handleTrackEnded();
      }
    );
  }, [handleTrackEnded]);

  // Playback Control Handlers
  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume();
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 4) {
      audioEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevTrack = queue[prevIdx];
      if ((!prevTrack.coverArt || prevTrack.coverArt === '') && currentTrack?.coverArt && prevTrack.albumId === currentTrack.albumId) {
        prevTrack.coverArt = currentTrack.coverArt;
      }
      setCurrentIndex(prevIdx);
      audioEngine.playTrack(prevTrack.audioUrl, prevTrack.duration, 0);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      const lastIdx = queue.length - 1;
      const lastTrack = queue[lastIdx];
      setCurrentIndex(lastIdx);
      audioEngine.playTrack(lastTrack.audioUrl, lastTrack.duration, 0);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * queue.length);
      const nextTrack = queue[nextIdx];
      setCurrentIndex(nextIdx);
      audioEngine.playTrack(nextTrack.audioUrl, nextTrack.duration, 0);
      setIsPlaying(true);
      return;
    }

    if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      const nextTrack = queue[nextIdx];
      if ((!nextTrack.coverArt || nextTrack.coverArt === '') && currentTrack?.coverArt && nextTrack.albumId === currentTrack.albumId) {
        nextTrack.coverArt = currentTrack.coverArt;
      }
      setCurrentIndex(nextIdx);
      audioEngine.playTrack(nextTrack.audioUrl, nextTrack.duration, 0);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setCurrentIndex(0);
      const nextTrack = queue[0];
      audioEngine.playTrack(nextTrack.audioUrl, nextTrack.duration, 0);
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    audioEngine.seek(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    audioEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMute(nextMuted);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleToggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  // Ensure every track in the list has valid coverArt (inheriting from album or sibling)
  const sanitizeTracks = (tracks: Track[]): Track[] => {
    return tracks.map((t) => {
      let finalCover = t.coverArt;
      if (!finalCover || finalCover.trim() === '') {
        const siblingWithCover = tracks.find((s) => s.albumId === t.albumId && s.coverArt);
        finalCover = siblingWithCover?.coverArt || subsonicService.getCoverArtForAlbum(t.albumId, t.album) || '';
      }
      return {
        ...t,
        coverArt: finalCover,
      };
    });
  };

  // Queue actions
  const playTrackDirectly = (track: Track) => {
    // Ensure track has coverArt
    if (!track.coverArt || track.coverArt === '') {
      track.coverArt = subsonicService.getCoverArtForAlbum(track.albumId, track.album);
    }

    const existingIdx = queue.findIndex((t) => t.id === track.id);
    if (existingIdx !== -1) {
      setCurrentIndex(existingIdx);
      audioEngine.playTrack(track.audioUrl, track.duration, 0);
      setIsPlaying(true);
    } else {
      const newQueue = [...queue, track];
      setQueue(newQueue);
      setCurrentIndex(newQueue.length - 1);
      audioEngine.playTrack(track.audioUrl, track.duration, 0);
      setIsPlaying(true);
    }
  };

  const playTracksList = (tracks: Track[], shuffle = false) => {
    if (tracks.length === 0) return;
    const sanitized = sanitizeTracks(tracks);
    const listToPlay = shuffle ? [...sanitized].sort(() => Math.random() - 0.5) : [...sanitized];
    setQueue(listToPlay);
    setCurrentIndex(0);
    audioEngine.playTrack(listToPlay[0].audioUrl, listToPlay[0].duration, 0);
    setIsPlaying(true);
  };

  const addTracksToQueue = (tracks: Track[]) => {
    const sanitized = sanitizeTracks(tracks);
    setQueue((prev) => [...prev, ...sanitized]);
    setIsQueueOpen(true);
  };

  // Navigation handlers
  const handleNavigateToArtist = (artistId: string) => {
    setIsNowPlayingOpen(false);
    setSelectedArtistId(artistId);
    setCurrentView('artist');
  };

  const handleNavigateToAlbum = (albumId: string) => {
    setIsNowPlayingOpen(false);
    setSelectedAlbumId(albumId);
    setCurrentView('album');
  };

  const handleSelectGenre = (genreName: string) => {
    setSelectedGenreName(genreName);
    setCurrentView('genre');
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setSelectedArtistId(null);
    setSelectedAlbumId(null);
    setSelectedGenreName(null);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'Escape') {
        if (isNowPlayingOpen) setIsNowPlayingOpen(false);
        if (isQueueOpen) setIsQueueOpen(false);
        if (isServerSettingsOpen) setIsServerSettingsOpen(false);
        if (isDockerGuideOpen) setIsDockerGuideOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="relative w-screen h-screen bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Dynamic View Router */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'library' && (
          <LibraryView
            artists={artists}
            genres={genres}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectArtist={handleNavigateToArtist}
            onSelectGenre={handleSelectGenre}
            onPlayArtist={(art) => {
              subsonicService.getArtist(art.id).then((fullArt) => {
                const tracks = (fullArt?.albums || []).flatMap((a) => a.tracks || []);
                if (tracks.length > 0) playTracksList(tracks);
              });
            }}
            onOpenServerSettings={() => setIsServerSettingsOpen(true)}
            onOpenDockerGuide={() => setIsDockerGuideOpen(true)}
            isConnectedToServer={serverConfig.isConnected}
            serverName={serverConfig.serverName}
          />
        )}

        {currentView === 'artist' && activeArtistObj && (
          <ArtistProfileView
            artist={activeArtistObj}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onBack={handleBackToLibrary}
            onSelectAlbum={handleNavigateToAlbum}
            onPlayTrack={playTrackDirectly}
            onPlayAll={playTracksList}
          />
        )}

        {currentView === 'album' && activeAlbumObj && (
          <AlbumProfileView
            album={activeAlbumObj}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onBack={() => {
              if (selectedArtistId) {
                setCurrentView('artist');
              } else {
                handleBackToLibrary();
              }
            }}
            onSelectArtist={handleNavigateToArtist}
            onPlayTracksFromAlbum={playTracksList}
            onPlayAlbum={(alb, shuffle) => playTracksList(alb.tracks || [], shuffle)}
            onAddToQueue={addTracksToQueue}
          />
        )}

        {currentView === 'genre' && selectedGenreName && (
          <GenreDetailView
            genreName={selectedGenreName}
            albums={albums}
            tracks={queue}
            onBack={handleBackToLibrary}
            onSelectAlbum={handleNavigateToAlbum}
            onPlayTrack={playTrackDirectly}
            onPlayAll={playTracksList}
          />
        )}
      </div>

      {/* Persistent Mini Player at bottom when browsing */}
      {!isNowPlayingOpen && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onOpenNowPlaying={() => setIsNowPlayingOpen(true)}
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          onNavigateToArtist={handleNavigateToArtist}
          onNavigateToAlbum={handleNavigateToAlbum}
        />
      )}

      {/* Minimal Now Playing Screen (Fullscreen / Overlay) */}
      {isNowPlayingOpen && (
        <NowPlayingView
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleShuffle={handleToggleShuffle}
          onToggleRepeat={handleToggleRepeat}
          onMinimize={() => setIsNowPlayingOpen(false)}
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          onNavigateToArtist={handleNavigateToArtist}
          onNavigateToAlbum={handleNavigateToAlbum}
        />
      )}

      {/* Playback Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentIndex={currentIndex}
        onSelectTrack={(idx) => {
          setCurrentIndex(idx);
          const t = queue[idx];
          if (t) {
            audioEngine.playTrack(t.audioUrl, t.duration, 0);
            setIsPlaying(true);
          }
        }}
        onRemoveTrack={(idx) => {
          const nextQ = queue.filter((_, i) => i !== idx);
          setQueue(nextQ);
          if (idx === currentIndex) {
            if (nextQ[idx]) {
              audioEngine.playTrack(nextQ[idx].audioUrl, nextQ[idx].duration, 0);
            } else if (nextQ.length > 0) {
              setCurrentIndex(0);
              audioEngine.playTrack(nextQ[0].audioUrl, nextQ[0].duration, 0);
            } else {
              setCurrentIndex(-1);
              audioEngine.pause();
              setIsPlaying(false);
            }
          } else if (idx < currentIndex) {
            setCurrentIndex(currentIndex - 1);
          }
        }}
        onClearQueue={() => {
          setQueue([]);
          setCurrentIndex(-1);
          audioEngine.pause();
          setIsPlaying(false);
        }}
      />

      {/* Server Settings Modal */}
      <ServerSettingsModal
        isOpen={isServerSettingsOpen}
        onClose={() => setIsServerSettingsOpen(false)}
        onConnected={loadLibrary}
        onDisconnected={loadLibrary}
      />

      {/* Docker Guide Modal */}
      <DockerGuideModal
        isOpen={isDockerGuideOpen}
        onClose={() => setIsDockerGuideOpen(false)}
      />
    </div>
  );
}
