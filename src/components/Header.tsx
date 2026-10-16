import React from 'react';
import { Sparkles, MessageSquareHeart, History, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenChat: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  chatMessageCount: number;
  onToggleSettings?: () => void;
  showSettings?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenChat,
  onOpenHistory,
  historyCount,
  chatMessageCount,
  onToggleSettings,
  showSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800/80 px-4 py-3 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 p-[1.5px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                Aura<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">Wall</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                9:16 AI
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-none">Phone Wallpaper Studio</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onToggleSettings && (
            <button
              onClick={onToggleSettings}
              className={`p-2 rounded-xl text-neutral-400 hover:text-white transition-colors border ${
                showSettings
                  ? 'bg-neutral-800 text-white border-neutral-700'
                  : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800'
              }`}
              title="Studio Settings"
              aria-label="Studio Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Wallpaper Collection"
            aria-label="Wallpaper Collection"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-bold rounded-full bg-violet-600 text-white flex items-center justify-center border-2 border-neutral-950">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-medium shadow-md shadow-violet-500/20 transition-all border border-violet-400/30 active:scale-95"
            aria-label="AI Wallpaper Stylist Chat"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-fuchsia-200" />
            <span>AI Stylist</span>
            {chatMessageCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
