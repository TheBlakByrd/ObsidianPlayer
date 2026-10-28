import React, { useState, useRef, useCallback } from 'react';

interface AlphabetSidebarProps {
  availableLetters: string[];
  activeLetter?: string;
  onSelectLetter: (letter: string) => void;
}

export const AlphabetSidebar: React.FC<AlphabetSidebarProps> = ({
  availableLetters,
  activeLetter,
  onSelectLetter,
}) => {
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const [bubbleY, setBubbleY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handlePointerMove = useCallback((clientY: number) => {
    if (!containerRef.current || availableLetters.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const clampedY = Math.max(0, Math.min(rect.height, relativeY));
    const index = Math.floor((clampedY / rect.height) * availableLetters.length);
    const clampedIndex = Math.max(0, Math.min(availableLetters.length - 1, index));
    const letter = availableLetters[clampedIndex];

    if (letter) {
      setHoveredLetter(letter);
      setBubbleY(clampedY);
      onSelectLetter(letter);
    }
  }, [availableLetters, onSelectLetter]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handlePointerMove(e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging.current) {
        handlePointerMove(moveEvent.clientY);
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setHoveredLetter(null);
      setBubbleY(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      isDragging.current = true;
      handlePointerMove(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current && e.touches[0]) {
      handlePointerMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setHoveredLetter(null);
    setBubbleY(null);
  };

  if (availableLetters.length === 0) return null;

  return (
    <aside
      aria-label="Alphabet quick navigation"
      className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 select-none flex items-center"
    >
      {/* Floating Magnified Letter Indicator */}
      {hoveredLetter && bubbleY !== null && (
        <div
          className="absolute right-10 -translate-y-1/2 w-11 h-11 rounded-full bg-neutral-900 border border-neutral-700 text-white font-mono text-lg font-bold flex items-center justify-center shadow-2xl pointer-events-none transition-all duration-75"
          style={{ top: `${bubbleY}px` }}
        >
          {hoveredLetter}
        </div>
      )}

      {/* Vertical alphabet column */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="py-3 px-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/5 flex flex-col items-center justify-between text-[11px] font-mono tracking-wider cursor-pointer hover:bg-black/85 transition-colors shadow-lg"
        style={{ minHeight: `${Math.min(availableLetters.length * 20, 480)}px` }}
      >
        {availableLetters.map((letter) => {
          const isActive = letter === activeLetter;
          const isHovered = letter === hoveredLetter;

          return (
            <button
              key={letter}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLetter(letter);
              }}
              onMouseEnter={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                  setHoveredLetter(letter);
                  setBubbleY(e.clientY - rect.top);
                }
              }}
              onMouseLeave={() => {
                if (!isDragging.current) {
                  setHoveredLetter(null);
                  setBubbleY(null);
                }
              }}
              className={`w-5 h-5 flex items-center justify-center rounded-full transition-all duration-150 ${
                isActive || isHovered
                  ? 'text-white font-bold scale-125 bg-white/10'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
