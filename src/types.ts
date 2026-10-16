export type AspectRatioType = '9:16' | '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '16:9' | '21:9';

export type ImageSizeType = '1K' | '2K' | '4K';

export type ModelType = 'gemini-3-pro-image-preview' | 'gemini-nano-banana-2.1';

export interface Wallpaper {
  id: string;
  url: string;
  prompt: string;
  variationIndex?: number;
  aspectRatio: string;
  imageSize: string;
  model: string;
  isRemix?: boolean;
  createdAt: string;
  referenceImageThumb?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  extractedPrompt?: string;
}

export interface VibePreset {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
  category: 'lo-fi' | 'cyberpunk' | 'minimal' | 'nature' | 'abstract' | 'retro';
}
