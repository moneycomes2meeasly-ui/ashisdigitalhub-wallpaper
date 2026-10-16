import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
  Ratio,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { AspectRatioType, ImageSizeType, ModelType, Wallpaper, VibePreset } from '../types';
import { VIBE_PRESETS } from '../data/curatedPresets';

interface VibeInputProps {
  prompt: string;
  setPrompt: (v: string) => void;
  aspectRatio: AspectRatioType;
  setAspectRatio: (r: AspectRatioType) => void;
  imageSize: ImageSizeType;
  setImageSize: (s: ImageSizeType) => void;
  model: ModelType;
  setModel: (m: ModelType) => void;
  referenceWallpaper: Wallpaper | null;
  onClearReference: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  showSettings: boolean;
  setShowSettings: (s: boolean) => void;
}

export const VibeInput: React.FC<VibeInputProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  imageSize,
  setImageSize,
  model,
  setModel,
  referenceWallpaper,
  onClearReference,
  onGenerate,
  isGenerating,
  showSettings,
  setShowSettings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const aspectOptions: { label: string; value: AspectRatioType; desc: string }[] = [
    { label: '9:16', value: '9:16', desc: 'Phone Wallpaper (Default)' },
    { label: '1:1', value: '1:1', desc: 'Square' },
    { label: '2:3', value: '2:3', desc: 'Classic Portrait' },
    { label: '3:2', value: '3:2', desc: 'Classic Landscape' },
    { label: '3:4', value: '3:4', desc: 'Standard Tall' },
    { label: '4:3', value: '4:3', desc: 'Standard Wide' },
    { label: '16:9', value: '16:9', desc: 'Desktop / TV' },
    { label: '21:9', value: '21:9', desc: 'Ultrawide' },
  ];

  const sizeOptions: { label: string; value: ImageSizeType; sub: string }[] = [
    { label: '1K', value: '1K', sub: 'Standard HD' },
    { label: '2K', value: '2K', sub: 'Retina Crisp' },
    { label: '4K', value: '4K', sub: 'Studio Ultra' },
  ];

  const handleSelectPreset = (preset: VibePreset) => {
    setPrompt(preset.prompt);
  };

  const isRemixMode = Boolean(referenceWallpaper);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col gap-3">
      {/* Active Remix Reference Banner */}
      {isRemixMode && referenceWallpaper && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/80 via-fuchsia-950/60 to-neutral-900 border border-violet-500/40 p-3 shadow-lg shadow-violet-950/40 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-20 rounded-xl overflow-hidden border-2 border-violet-400/60 shrink-0 shadow-md">
              <img
                src={referenceWallpaper.url}
                alt="Reference Wallpaper"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
                <span className="text-[9px] font-bold text-violet-300 px-1 py-0.2 rounded bg-black/50">
                  REF
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/30 text-violet-200 border border-violet-400/40 flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
                  Remix Mode Active
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white truncate">
                Remixing Variation #{referenceWallpaper.variationIndex || '1'}
              </h4>
              <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5">
                Current image will be used as visual reference for the 4 new variations.
              </p>
            </div>

            <button
              onClick={onClearReference}
              className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700"
              title="Cancel Remix Mode"
              aria-label="Cancel Remix"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-2xl bg-neutral-900/90 border border-neutral-800 p-3.5 shadow-xl backdrop-blur-xl focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="vibe-prompt" className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Describe your wallpaper vibe</span>
          </label>
          <span className="text-[11px] text-neutral-500">Generates 4 variations</span>
        </div>

        <div className="relative">
          <textarea
            id="vibe-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "rainy cyberpunk lo-fi street with neon magenta reflections" or "minimalist botanical dusk"'
            rows={2}
            className="w-full bg-neutral-950/70 border border-neutral-800/90 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 resize-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onGenerate();
              }
            }}
          />
          {prompt && (
            <button
              onClick={() => setPrompt('')}
              className="absolute right-2.5 top-2.5 p-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Vibe Chips Carousel */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Quick Vibe Inspiration
            </span>
            <span className="text-[10px] text-neutral-500">Tap to fill</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar py-0.5">
            {VIBE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 hover:border-violet-500/40 transition-all active:scale-95"
              >
                <span>{p.emoji}</span>
                <span className="font-medium text-[11px]">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Studio Controls Toggle Button */}
        <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors py-1 px-1 rounded"
          >
            <Sliders className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-medium">Studio Controls</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
              {aspectRatio} • {imageSize}
            </span>
            {showSettings ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </button>

          <span className="text-[11px] text-neutral-400 font-medium">
            {model === 'gemini-3-pro-image-preview' ? 'Pro Quality' : 'Nano Fast'}
          </span>
        </div>

        {/* Collapsible Studio Controls Panel */}
        {showSettings && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-3.5 animate-in fade-in duration-200">
            {/* Aspect Ratio Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                  <Ratio className="w-3 h-3 text-violet-400" />
                  Aspect Ratio
                </span>
                <span className="text-[10px] text-violet-300 font-mono">
                  {aspectRatio === '9:16' ? 'Recommended for Phones' : aspectRatio}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {aspectOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAspectRatio(opt.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-all text-center border ${
                      aspectRatio === opt.value
                        ? 'bg-violet-600/30 text-violet-200 border-violet-500 shadow-sm'
                        : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800 hover:border-neutral-700'
                    }`}
                    title={opt.desc}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Resolution (1K, 2K, 4K) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-violet-400" />
                  Image Resolution
                </span>
                <span className="text-[10px] text-neutral-400">Higher resolution = finer detail</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz.value}
                    onClick={() => setImageSize(sz.value)}
                    className={`p-2 rounded-lg text-left transition-all border ${
                      imageSize === sz.value
                        ? 'bg-violet-600/30 text-violet-200 border-violet-500'
                        : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-white">{sz.label}</div>
                    <div className="text-[10px] text-neutral-400">{sz.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-violet-400" />
                  AI Image Engine
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setModel('gemini-3-pro-image-preview')}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    model === 'gemini-3-pro-image-preview'
                      ? 'bg-violet-600/30 text-violet-200 border-violet-500'
                      : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Studio Pro
                    <span className="text-[9px] px-1 py-0.2 rounded bg-violet-500/40 text-violet-200">
                      gemini-3-pro
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Highest aesthetic fidelity & lighting
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModel('gemini-nano-banana-2.1')}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    model === 'gemini-nano-banana-2.1'
                      ? 'bg-violet-600/30 text-violet-200 border-violet-500'
                      : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Ultra Fast
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      nano-2.1
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Rapid iteration & experimentation
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate / Remix Action Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`mt-3 w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            isGenerating
              ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700'
              : !prompt.trim()
              ? 'bg-neutral-800/80 text-neutral-500 border border-neutral-800 cursor-not-allowed'
              : isRemixMode
              ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white shadow-fuchsia-600/25 border border-fuchsia-400/30'
              : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-600/25 border border-violet-400/30'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
              <span>Generating 4 Phone Variations...</span>
            </>
          ) : isRemixMode ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Remix 4 Variations (Reference Mode)</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate 4 Wallpapers ({aspectRatio})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
