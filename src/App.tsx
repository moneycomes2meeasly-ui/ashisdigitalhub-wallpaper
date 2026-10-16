import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VibeInput } from './components/VibeInput';
import { WallpaperGrid } from './components/WallpaperGrid';
import { FullscreenModal } from './components/FullscreenModal';
import { StylistChatModal } from './components/StylistChatModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AspectRatioType, ImageSizeType, ModelType, Wallpaper, ChatMessage } from './types';
import { INITIAL_FEATURED_WALLPAPERS } from './data/curatedPresets';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'aurawall_history_v1';

export default function App() {
  const [prompt, setPrompt] = useState<string>(
    'Rainy cyberpunk lo-fi street in Neo Tokyo, glistening wet pavement reflecting neon magenta and cyan signs, steam rising, cozy warm ramen shop window, 9:16 mobile wallpaper'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [imageSize, setImageSize] = useState<ImageSizeType>('1K');
  const [model, setModel] = useState<ModelType>('gemini-3-pro-image-preview');

  // Generation state
  const [currentBatch, setCurrentBatch] = useState<Wallpaper[]>(INITIAL_FEATURED_WALLPAPERS);
  const [referenceWallpaper, setReferenceWallpaper] = useState<Wallpaper | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [selectedWallpaperIndex, setSelectedWallpaperIndex] = useState<number>(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Vault / History
  const [history, setHistory] = useState<Wallpaper[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_FEATURED_WALLPAPERS;
    } catch {
      return INITIAL_FEATURED_WALLPAPERS;
    }
  });

  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: "Hey! I'm Aura Stylist, your art director for mobile phone wallpapers. What kind of vibe or visual mood are you craving for your screen today? Tell me, or pick from the ideas below!",
      timestamp: 'Just now',
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // ignore storage quota issues
    }
  }, [history]);

  // Clean error banner after 8 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Generate 4 Wallpapers (or Remix 4 Wallpapers)
  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
          imageSize,
          model,
          count: 4,
          referenceImage: referenceWallpaper ? referenceWallpaper.url : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate wallpapers');
      }

      if (data.wallpapers && data.wallpapers.length > 0) {
        setCurrentBatch(data.wallpapers);
        setHistory((prev) => [...data.wallpapers, ...prev.filter((p) => !data.wallpapers.some((nw: Wallpaper) => nw.id === p.id))]);
      } else {
        throw new Error('No wallpapers were returned by the generator');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(
        err?.message || 'Could not generate wallpapers. Please check your Gemini connection or try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Fullscreen View
  const handleSelectWallpaper = (wallpaper: Wallpaper, index: number) => {
    setSelectedWallpaper(wallpaper);
    setSelectedWallpaperIndex(index);
    setIsFullscreenOpen(true);
  };

  // Navigate next/prev in fullscreen
  const handleNavigateFullscreen = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < currentBatch.length) {
      setSelectedWallpaperIndex(newIndex);
      setSelectedWallpaper(currentBatch[newIndex]);
    }
  };

  // Download wallpaper
  const handleDownload = async (wallpaper: Wallpaper) => {
    try {
      const slug = (wallpaper.prompt || 'aurawall')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 30);
      const filename = `aurawall-${slug}-${wallpaper.variationIndex || 1}.png`;

      // If data URI
      if (wallpaper.url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = wallpaper.url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch as blob
        const res = await fetch(wallpaper.url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }

      setDownloadedIds((prev) => new Set(prev).add(wallpaper.id));
    } catch (err) {
      console.error('Download error:', err);
      window.open(wallpaper.url, '_blank');
    }
  };

  // Remix wallpaper: Sets current wallpaper as reference for next batch
  const handleRemix = (wallpaper: Wallpaper) => {
    setReferenceWallpaper(wallpaper);
    setIsFullscreenOpen(false);
    setIsHistoryOpen(false);

    // Scroll to top where the input is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Send message to Gemini chat
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get stylist advice');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || "I've tailored a custom prompt for you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: "I couldn't reach the styling atelier right now, but feel free to tweak the prompt above and tap Generate!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Use prompt recommended by the Stylist chat
  const handleUsePromptFromChat = (promptText: string) => {
    setPrompt(promptText);
    setIsChatOpen(false);
    handleGenerate(promptText);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all saved wallpapers in your vault?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Subtle Ambience Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-[90px]" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Sticky Header */}
      <Header
        onOpenChat={() => setIsChatOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        chatMessageCount={messages.length > 1 ? messages.length - 1 : 0}
        onToggleSettings={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* Error Notification Toast */}
        {errorMessage && (
          <div className="w-full max-w-md mx-auto px-4 pt-2">
            <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 shadow-lg backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Generation Alert</span>
                <p className="mt-0.5 text-[11px] leading-relaxed text-red-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vibe Input & Studio Controls */}
        <VibeInput
          prompt={prompt}
          setPrompt={setPrompt}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          imageSize={imageSize}
          setImageSize={setImageSize}
          model={model}
          setModel={setModel}
          referenceWallpaper={referenceWallpaper}
          onClearReference={() => setReferenceWallpaper(null)}
          onGenerate={() => handleGenerate()}
          isGenerating={isGenerating}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />

        {/* 4 Variations Grid in 9:16 Aspect Ratio */}
        <WallpaperGrid
          wallpapers={currentBatch}
          isGenerating={isGenerating}
          onSelectWallpaper={handleSelectWallpaper}
          onQuickRemix={handleRemix}
          onQuickDownload={handleDownload}
          downloadedIds={downloadedIds}
          currentVibePrompt={prompt}
        />
      </main>

      {/* Fullscreen Preview Lightbox Modal with Lock Screen Mockup */}
      <FullscreenModal
        wallpaper={selectedWallpaper}
        wallpapers={currentBatch}
        currentIndex={selectedWallpaperIndex}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        onRemix={handleRemix}
        onDownload={handleDownload}
        onNavigate={handleNavigateFullscreen}
        isDownloaded={selectedWallpaper ? downloadedIds.has(selectedWallpaper.id) : false}
      />

      {/* Gemini AI Wallpaper Stylist Chat Modal */}
      <StylistChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isSending={isSendingChat}
        onUsePrompt={handleUsePromptFromChat}
      />

      {/* Wallpaper Vault / History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        wallpapers={history}
        onSelectWallpaper={(w, i) => {
          setSelectedWallpaper(w);
          setSelectedWallpaperIndex(i);
          setIsHistoryOpen(false);
          setIsFullscreenOpen(true);
        }}
        onClearHistory={handleClearHistory}
        onRemix={handleRemix}
      />
    </div>
  );
}
