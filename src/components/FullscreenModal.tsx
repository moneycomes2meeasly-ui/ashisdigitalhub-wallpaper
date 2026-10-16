import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  RefreshCw,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  Share2,
  Sliders,
  Sparkles,
  Info,
  Flashlight,
  Camera,
  Lock,
  Wifi,
  BatteryCharging,
} from 'lucide-react';
import { Wallpaper } from '../types';

interface FullscreenModalProps {
  wallpaper: Wallpaper | null;
  wallpapers: Wallpaper[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
  onDownload: (wallpaper: Wallpaper) => void;
  onNavigate: (newIndex: number) => void;
  isDownloaded: boolean;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  wallpaper,
  wallpapers,
  currentIndex,
  isOpen,
  onClose,
  onRemix,
  onDownload,
  onNavigate,
  isDownloaded,
}) => {
  const [showLockScreenMockup, setShowLockScreenMockup] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [currentDate, setCurrentDate] = useState<string>('Friday, October 16');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString(undefined, options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < wallpapers.length - 1) {
        onNavigate(currentIndex + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, wallpapers.length, onClose, onNavigate]);

  if (!isOpen || !wallpaper) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AuraWall Phone Wallpaper',
          text: `Check out this AI phone wallpaper: "${wallpaper.prompt}"`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(wallpaper.url);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      // Ignore aborts
    }
  };

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < wallpapers.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Top Floating Controls Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-neutral-800 text-white border border-white/10 backdrop-blur-md transition-colors"
            title="Close Preview"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-white font-mono">
            {currentIndex + 1} / {wallpapers.length}
          </span>
        </div>

        {/* Lock Screen Toggle & Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLockScreenMockup(!showLockScreenMockup)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
              showLockScreenMockup
                ? 'bg-violet-600/80 border-violet-400 text-white shadow-lg shadow-violet-600/25'
                : 'bg-black/60 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Lock Screen Simulation"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Lockscreen UI</span>
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
              showInfo
                ? 'bg-neutral-800 border-neutral-700 text-white'
                : 'bg-black/60 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Wallpaper Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Wallpaper Preview Container */}
      <div className="relative w-full h-full max-w-sm max-h-[88vh] mx-auto flex items-center justify-center p-3 select-none">
        {/* Smartphone Bezel & Frame Mockup */}
        <div className="relative w-full h-full max-w-[380px] aspect-[9/16] rounded-[42px] overflow-hidden border-[6px] border-neutral-800/90 shadow-2xl shadow-violet-950/40 bg-black flex flex-col justify-between">
          {/* Wallpaper Image */}
          <img
            src={wallpaper.url}
            alt={wallpaper.prompt}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dynamic Phone Lock Screen Overlay */}
          {showLockScreenMockup && (
            <div className="relative z-20 w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none transition-opacity duration-300">
              {/* Phone Status Bar (Top) */}
              <div className="flex items-center justify-between text-white text-[12px] font-medium pt-1 px-2">
                <span>{currentTime}</span>
                {/* Dynamic Island / Speaker notch mockup */}
                <div className="w-20 h-4 bg-black/90 rounded-full border border-neutral-800/80 mx-auto" />
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryCharging className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Lock Screen Clock & Date (Center Top) */}
              <div className="text-center text-white mt-12 flex flex-col items-center">
                <Lock className="w-3.5 h-3.5 text-white/80 mb-1" />
                <div className="text-xs font-medium tracking-wide text-white/90 drop-shadow-md">
                  {currentDate}
                </div>
                <div className="text-6xl font-light tracking-tight font-sans drop-shadow-lg text-white">
                  {currentTime}
                </div>

                {/* Minimalist Lockscreen Widget Mockup */}
                <div className="mt-3 px-3 py-1.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 text-[11px] text-white/90 flex items-center gap-2 shadow-sm">
                  <span>🌧️ 68°</span>
                  <span>•</span>
                  <span>Rainy Lo-Fi Vibes</span>
                </div>
              </div>

              {/* Bottom Phone Action Icons (Flashlight, Home Bar, Camera) */}
              <div className="flex items-center justify-between w-full px-4 pb-2">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-lg">
                  <Flashlight className="w-4 h-4" />
                </div>

                {/* Home Indicator Bar */}
                <div className="w-32 h-1 rounded-full bg-white/70" />

                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-lg">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Details Overlay Panel (if toggled) */}
          {showInfo && (
            <div className="absolute inset-x-3 bottom-24 z-30 p-4 rounded-2xl bg-neutral-950/90 backdrop-blur-xl border border-neutral-700 text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Wallpaper Specs
                </h4>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed italic mb-3">
                "{wallpaper.prompt}"
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-500 block">Aspect Ratio</span>
                  <span className="font-mono font-medium text-white">
                    {wallpaper.aspectRatio || '9:16'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-500 block">Resolution</span>
                  <span className="font-mono font-medium text-white">
                    {wallpaper.imageSize || '1K'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 col-span-2">
                  <span className="text-neutral-500 block">Model Engine</span>
                  <span className="font-mono font-medium text-violet-300">
                    {wallpaper.model || 'gemini-3-pro-image-preview'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Previous Variation Arrow */}
        {hasPrev && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-neutral-800 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 z-40"
            title="Previous variation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Variation Arrow */}
        {hasNext && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-neutral-800 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 z-40"
            title="Next variation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Action Bar (Download, Remix, Share) */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-sm mx-auto flex items-center justify-between gap-2.5">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors shrink-0"
            title="Share wallpaper"
          >
            {copiedShare ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>

          {/* Remix Button - Uses current image as reference for next batch! */}
          <button
            onClick={() => onRemix(wallpaper)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/30 border border-fuchsia-400/30 transition-all active:scale-95"
            title="Use as reference image for next batch"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Remix This Wallpaper</span>
          </button>

          {/* Download Button */}
          <button
            onClick={() => onDownload(wallpaper)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 border border-violet-400/30 transition-all active:scale-95"
            title="Download full resolution image"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Wallpaper</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
