import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Shuffle,
  Plus,
  Clock,
  Share2,
  X,
  Copy,
  Check,
  Link2,
  Globe,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Album, Track, AlbumShare } from '../types/music';
import { subsonicService } from '../services/subsonic';

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

type ExpiryOption = 'default' | '1d' | '7d' | '30d' | '1y';

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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareDescription, setShareDescription] = useState(`${album.artist} — ${album.title}`);
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('default');
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [generatedShare, setGeneratedShare] = useState<AlbumShare | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'public' | 'navidrome' | 'obsidian' | null>(null);

  // Reset modal share state when viewing a different album
  useEffect(() => {
    setShareDescription(`${album.artist} — ${album.title}`);
    setExpiryOption('default');
    setGeneratedShare(null);
    setShareError(null);
    setCopiedField(null);
    setIsShareModalOpen(false);
  }, [album.id, album.artist, album.title]);

  // Close share modal on Escape
  useEffect(() => {
    if (!isShareModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsShareModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isShareModalOpen]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalMinutes = Math.round(album.duration / 60);
  const isConnected = subsonicService.isConnectedToServer() && !album.id.startsWith('alb-');
  const navidromeAlbumUrl = subsonicService.getNavidromeAlbumUrl(album.id);
  const obsidianAlbumUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?album=${encodeURIComponent(album.id)}`
      : `/?album=${encodeURIComponent(album.id)}`;

  const copyToClipboard = async (text: string, field: 'public' | 'navidrome' | 'obsidian') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField((prev) => (prev === field ? null : prev));
      }, 2200);
    } catch {
      // ignore clipboard errors if blocked
    }
  };

  const getExpiryTimestamp = (option: ExpiryOption): number | undefined => {
    const now = Date.now();
    switch (option) {
      case '1d':
        return now + 24 * 60 * 60 * 1000;
      case '7d':
        return now + 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return now + 30 * 24 * 60 * 60 * 1000;
      case '1y':
        return now + 365 * 24 * 60 * 60 * 1000;
      default:
        return undefined;
    }
  };

  const handleCreatePublicShare = async () => {
    setIsCreatingShare(true);
    setShareError(null);

    const expiresMs = getExpiryTimestamp(expiryOption);
    const result = await subsonicService.createAlbumShare(album.id, shareDescription, expiresMs);

    setIsCreatingShare(false);

    if (result.success && result.share) {
      setGeneratedShare(result.share);
      await copyToClipboard(result.share.url, 'public');
    } else {
      setShareError(result.error || 'Could not create share link.');
    }
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
          <div className="flex items-center flex-wrap gap-3 pt-3">
            <button
              type="button"
              onClick={() => onPlayAlbum(album, false)}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Album</span>
            </button>
            <button
              type="button"
              onClick={() => onPlayAlbum(album, true)}
              className="px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium text-xs flex items-center gap-2 hover:bg-neutral-800 hover:text-white transition-colors active:scale-95 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
            <button
              type="button"
              onClick={() => onAddToQueue(tracks)}
              className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Add all to queue"
              aria-label="Add all to queue"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium text-xs flex items-center gap-2 hover:bg-neutral-800 hover:text-white transition-colors active:scale-95 cursor-pointer"
              title="Share album link"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
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
                  <span
                    className={`w-6 text-center text-xs font-mono group-hover:hidden ${
                      isSelected ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                    }`}
                  >
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
                    <div
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-white'
                      }`}
                    >
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

      {/* Share Album Modal */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={album.coverArt}
                  alt={album.title}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-lg object-cover border border-neutral-800 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white truncate">
                    Share "{album.title}"
                  </h2>
                  <p className="text-xs text-neutral-500 truncate">
                    {album.artist}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Public Navidrome Share Link */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <Globe className="w-4 h-4 text-neutral-400" />
                  <span>Public Navidrome Share Link</span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  No login required
                </span>
              </div>

              {isConnected ? (
                <div className="space-y-3 p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Share Note
                      </label>
                      <input
                        type="text"
                        value={shareDescription}
                        onChange={(e) => setShareDescription(e.target.value)}
                        placeholder="Optional message for your friend..."
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-lg px-3 py-2 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Expires
                      </label>
                      <select
                        value={expiryOption}
                        onChange={(e) => setExpiryOption(e.target.value as ExpiryOption)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-neutral-600"
                      >
                        <option value="default">Server Default</option>
                        <option value="1d">24 Hours</option>
                        <option value="7d">7 Days</option>
                        <option value="30d">30 Days</option>
                        <option value="1y">1 Year</option>
                      </select>
                    </div>
                  </div>

                  {generatedShare ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedShare.url}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="flex-1 bg-neutral-950 border border-emerald-800/60 text-emerald-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedShare.url, 'public')}
                          className="px-3.5 py-2 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
                        >
                          {copiedField === 'public' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Public share link ready</span>
                        <button
                          type="button"
                          onClick={handleCreatePublicShare}
                          disabled={isCreatingShare}
                          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isCreatingShare ? 'Generating...' : 'Generate new link'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreatePublicShare}
                      disabled={isCreatingShare}
                      className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {isCreatingShare ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating Navidrome Share...</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Create & Copy Public Share Link</span>
                        </>
                      )}
                    </button>
                  )}

                  {shareError && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 text-xs text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p>{shareError}</p>
                        {shareError.toLowerCase().includes('sharing') && (
                          <p className="text-[11px] text-neutral-400">
                            Tip: Enable public sharing in Navidrome with{' '}
                            <code className="text-neutral-300 bg-neutral-900 px-1 py-0.5 rounded">
                              ND_ENABLESHARING=true
                            </code>
                            , or copy one of the direct links below.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/70 text-xs text-neutral-400">
                  Connect your Navidrome server in Settings to generate public Navidrome share links.
                </div>
              )}
            </div>

            {/* Section 2: Direct Navidrome Album Link (when connected) */}
            {navidromeAlbumUrl && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                    <Link2 className="w-4 h-4 text-neutral-400" />
                    <span>Navidrome Web Link</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    For Navidrome users
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={navidromeAlbumUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(navidromeAlbumUrl, 'navidrome')}
                    className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedField === 'navidrome' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Section 3: Obsidian Player Link */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <Link2 className="w-4 h-4 text-neutral-400" />
                  <span>Obsidian Album Link</span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  Opens in this player
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={obsidianAlbumUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(obsidianAlbumUrl, 'obsidian')}
                  className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedField === 'obsidian' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
