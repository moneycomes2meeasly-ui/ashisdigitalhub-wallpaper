import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Wand2,
  RefreshCw,
  MessageSquareHeart,
  Palette,
  Compass,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface StylistChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  onUsePrompt: (promptText: string) => void;
}

const STARTER_SUGGESTIONS = [
  'Cozy rainy lo-fi Tokyo window at dusk',
  'Dark AMOLED minimalist architectural shadows',
  'Dreamy Studio Ghibli style wildflower meadow',
  'Liquid iridescent 3D chrome ribbon',
  'Retro 80s vaporwave palm tree sunset',
];

export const StylistChatModal: React.FC<StylistChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isSending,
  onUsePrompt,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const msg = input.trim();
    setInput('');
    await onSendMessage(msg);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isSending) return;
    await onSendMessage(`I want a wallpaper inspired by: "${suggestion}". Help me craft the best aesthetic vibe and prompt.`);
  };

  // Helper to extract [PROMPT: ...]
  const renderMessageContent = (text: string) => {
    const promptRegex = /\[PROMPT:\s*([\s\S]*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = promptRegex.exec(text)) !== null) {
      // Preceding text
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Prompt extracted
      parts.push({
        type: 'prompt',
        content: match[1].trim(),
      });

      lastIndex = promptRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-2.5">
        {parts.map((p, i) => {
          if (p.type === 'text') {
            return (
              <p key={i} className="text-xs leading-relaxed whitespace-pre-wrap text-neutral-200">
                {p.content}
              </p>
            );
          }
          if (p.type === 'prompt') {
            return (
              <div
                key={i}
                className="p-3 rounded-xl bg-violet-950/70 border border-violet-500/40 text-left my-2 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-fuchsia-400" />
                    Recommended Prompt
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-200 leading-snug mb-2 italic">
                  "{p.content}"
                </p>
                <button
                  onClick={() => onUsePrompt(p.content)}
                  className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/30 transition-transform active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate This Wallpaper (4 Variations)</span>
                </button>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over sheet */}
      <div className="relative w-full max-w-md mx-auto bg-neutral-900 border-t border-neutral-700/80 rounded-t-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Top Handle & Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-violet-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">Aura Stylist</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Wallpaper Art Director & Prompt Advisor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Close Stylist Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Welcome Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-950/40 via-neutral-900 to-fuchsia-950/30 border border-neutral-800 text-neutral-300">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-violet-300">
              <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Looking for wallpaper inspiration?</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              Describe a mood, color palette, or scene you want for your lock screen. I'll guide the aesthetic and craft a custom prompt you can generate in one tap.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {STARTER_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-neutral-800/80 hover:bg-violet-600/30 hover:border-violet-500/50 text-neutral-300 hover:text-white border border-neutral-700 transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 shrink-0 flex items-center justify-center text-white mt-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-neutral-800/90 border border-neutral-700/80 text-neutral-200 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  ) : (
                    renderMessageContent(msg.text)
                  )}

                  <div
                    className={`text-[9px] font-mono mt-1 text-right ${
                      isUser ? 'text-violet-200/70' : 'text-neutral-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0 flex items-center justify-center text-neutral-300 mt-1">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isSending && (
            <div className="flex gap-2.5 items-center text-neutral-400">
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-3 h-3 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-neutral-800/90 border border-neutral-700/80 rounded-tl-xs flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-neutral-400 ml-1">Stylist is curating...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aura Stylist for ideas, palettes, or prompts..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-800 text-white disabled:text-neutral-500 shadow-md shadow-violet-600/30 transition-all active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
