import React from 'react';
import { X, Play, Trash2, ListMusic } from 'lucide-react';
import { Track } from '../types/music';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (index: number) => void;
  onClearQueue: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-white">Playback Queue</h2>
            <span className="text-xs text-neutral-500 font-mono">({queue.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                type="button"
                onClick={onClearQueue}
                className="text-xs text-neutral-400 hover:text-red-400 transition-colors px-2 py-1"
                title="Clear queue"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
              aria-label="Close queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-900/60 p-2">
          {queue.length === 0 ? (
            <div className="py-20 text-center text-neutral-500 text-xs">
              Queue is empty. Select an artist, album, or track to play.
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
                    isCurrent ? 'bg-neutral-900 border border-neutral-800' : 'hover:bg-neutral-900/40'
                  }`}
                >
                  <div
                    onClick={() => onSelectTrack(idx)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0 relative">
                      <img
                        src={track.coverArt}
                        alt={track.album}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium truncate ${
                        isCurrent ? 'text-emerald-400' : 'text-neutral-200 group-hover:text-white'
                      }`}>
                        {track.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {track.artist} · {track.album}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-neutral-500 tabular-nums">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveTrack(idx)}
                      className="p-1 text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
