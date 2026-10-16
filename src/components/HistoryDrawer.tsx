import React from 'react';
import { X, Trash2, Smartphone, Download, RefreshCw, Maximize2 } from 'lucide-react';
import { Wallpaper } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wallpapers: Wallpaper[];
  onSelectWallpaper: (wallpaper: Wallpaper, index: number) => void;
  onClearHistory: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  wallpapers,
  onSelectWallpaper,
  onClearHistory,
  onRemix,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex-1" onClick={onClose} />

      <div className="relative w-full max-w-md mx-auto bg-neutral-900 border-t border-neutral-700/80 rounded-t-3xl shadow-2xl flex flex-col h-[75vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Your Wallpaper Vault</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 font-mono">
                {wallpapers.length}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">All generated & curated phone wallpapers</p>
          </div>

          <div className="flex items-center gap-2">
            {wallpapers.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border border-neutral-700 transition-colors"
                title="Clear Vault"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of wallpapers */}
        <div className="flex-1 overflow-y-auto p-4">
          {wallpapers.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <Smartphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No saved wallpapers yet.</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Generate batches to save them here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {wallpapers.map((w, idx) => (
                <div
                  key={w.id}
                  onClick={() => onSelectWallpaper(w, idx)}
                  className="group relative aspect-[9/16] rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden cursor-pointer shadow-md hover:border-violet-500/50 transition-all"
                >
                  <img
                    src={w.url}
                    alt={w.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-neutral-300 backdrop-blur-sm">
                      {w.aspectRatio || '9:16'}
                    </span>
                  </div>

                  <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-between">
                    <p className="text-[10px] text-neutral-300 line-clamp-1 flex-1 mr-1">
                      {w.prompt}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemix(w);
                      }}
                      className="p-1 rounded-lg bg-black/60 hover:bg-violet-600 text-neutral-300 hover:text-white backdrop-blur-md transition-colors"
                      title="Remix this"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
