import React from 'react';
import {
  Download,
  RefreshCw,
  Eye,
  Sparkles,
  Smartphone,
  Maximize2,
  Check,
} from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  isGenerating: boolean;
  onSelectWallpaper: (wallpaper: Wallpaper, index: number) => void;
  onQuickRemix: (wallpaper: Wallpaper) => void;
  onQuickDownload: (wallpaper: Wallpaper) => void;
  downloadedIds: Set<string>;
  currentVibePrompt?: string;
}

export const WallpaperGrid: React.FC<WallpaperGridProps> = ({
  wallpapers,
  isGenerating,
  onSelectWallpaper,
  onQuickRemix,
  onQuickDownload,
  downloadedIds,
  currentVibePrompt,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 pb-20">
      {/* Section Header */}
      <div className="flex items-center justify-between my-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {isGenerating ? 'Synthesizing 4 Variations...' : '4 Phone Variations'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
          <span>Tap for full screen & lockscreen preview</span>
        </div>
      </div>

      {/* Grid of 4 Variations */}
      <div className="grid grid-cols-2 gap-3">
        {isGenerating ? (
          // 4 Skeletons while generating
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="relative aspect-[9/16] rounded-2xl bg-neutral-900 border border-neutral-800/80 overflow-hidden flex flex-col justify-between p-3"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/20 via-neutral-900 to-fuchsia-900/20 animate-pulse" />

              {/* Shimmer sweep effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
                style={{
                  animation: `shimmer 2s infinite ${index * 0.3}s ease-in-out`,
                }}
              />

              {/* Skeleton badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800/90 text-neutral-400 border border-neutral-700/60">
                  Variation #{index + 1}
                </span>
                <Sparkles className="w-3 h-3 text-violet-400/60 animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              {/* Center loader */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-2">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin mb-2" />
                <span className="text-[10px] text-neutral-300 font-medium">
                  {index === 0 && 'Atmospheric framing...'}
                  {index === 1 && 'Dreamy lighting...'}
                  {index === 2 && 'Dynamic color grading...'}
                  {index === 3 && 'Organic textures...'}
                </span>
                <span className="text-[9px] text-neutral-500 mt-0.5">9:16 mobile format</span>
              </div>

              {/* Bottom bar */}
              <div className="relative z-10 w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-pulse"
                  style={{ width: `${(index + 1) * 25}%` }}
                />
              </div>
            </div>
          ))
        ) : wallpapers.length > 0 ? (
          // 4 Loaded Variations
          wallpapers.map((wallpaper, index) => {
            const isDownloaded = downloadedIds.has(wallpaper.id);
            return (
              <div
                key={wallpaper.id}
                onClick={() => onSelectWallpaper(wallpaper, index)}
                className="group relative aspect-[9/16] rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-violet-500/60 overflow-hidden cursor-pointer shadow-lg hover:shadow-violet-500/10 transition-all duration-300 transform active:scale-[0.98]"
              >
                {/* Wallpaper Image */}
                <img
                  src={wallpaper.url}
                  alt={wallpaper.prompt || `Variation ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40 opacity-70 group-hover:opacity-60 transition-opacity" />

                {/* Top Header on Card */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-tight bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
                    Var #{index + 1}
                  </span>

                  {wallpaper.isRemix && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-fuchsia-500/80 backdrop-blur-md text-white shadow-sm flex items-center gap-0.5">
                      <RefreshCw className="w-2.5 h-2.5" />
                      Remix
                    </span>
                  )}
                </div>

                {/* Center "Tap to Preview" pill shown on hover/active */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>View Fullscreen</span>
                  </div>
                </div>

                {/* Bottom Action Footer on Card */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickRemix(wallpaper);
                      }}
                      className="p-1.5 rounded-xl bg-black/60 hover:bg-violet-600/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 transition-colors shadow-sm"
                      title="Remix this wallpaper"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickDownload(wallpaper);
                      }}
                      className={`p-1.5 rounded-xl backdrop-blur-md border border-white/10 transition-colors shadow-sm ${
                        isDownloaded
                          ? 'bg-emerald-600/80 text-white'
                          : 'bg-black/60 hover:bg-neutral-800 text-neutral-300 hover:text-white'
                      }`}
                      title="Download wallpaper"
                    >
                      {isDownloaded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-300 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                    {wallpaper.aspectRatio || '9:16'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-12 text-center text-neutral-500">
            <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No wallpapers generated yet.</p>
            <p className="text-[11px] text-neutral-600 mt-0.5">Describe your vibe above to start!</p>
          </div>
        )}
      </div>
    </div>
  );
};
