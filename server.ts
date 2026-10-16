import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function normalizeAspectRatio(ratio: string): string {
  const allowed = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
  if (allowed.includes(ratio)) return ratio;
  if (ratio === '2:3') return '3:4';
  if (ratio === '3:2') return '4:3';
  if (ratio === '21:9') return '16:9';
  return '9:16';
}

// Check key status
app.get('/api/status', (req, res) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedModels: ['gemini-3-pro-image-preview', 'gemini-nano-banana-2.1', 'gemini-3.8-flash'],
  });
});

// Endpoint to generate 4 variations of phone wallpapers
app.post('/api/generate-wallpapers', async (req, res) => {
  try {
    const {
      prompt,
      vibe,
      aspectRatio = '9:16',
      imageSize = '1K',
      model = 'gemini-3-pro-image-preview',
      count = 4,
      referenceImage,
    } = req.body;

    if (!prompt && !vibe) {
      return res.status(400).json({ error: 'Please provide a prompt or vibe description.' });
    }

    const basePrompt = prompt || vibe;
    const finalCount = Math.min(Math.max(Number(count) || 4, 1), 4);
    const validModel = model === 'gemini-nano-banana-2.1' ? 'gemini-nano-banana-2.1' : 'gemini-3-pro-image-preview';
    const targetAspect = normalizeAspectRatio(aspectRatio);

    // Build variation nuances to give 4 distinct artistic variations for wallpapers
    const variationStyles = [
      'Variation A: Atmospheric cinematic framing, rich contrast, balanced wallpaper composition, pristine negative space for phone clock',
      'Variation B: Ethereal dreamy lighting, soft volumetric shadows, ultra clean aesthetic focus',
      'Variation C: Dynamic perspective and vibrant color grading, high detail, striking visual presence',
      'Variation D: Subtle mood and organic texture nuances, cohesive aesthetic harmony',
    ];

    // Reference image payload if remixing
    const refParts: any[] = [];
    if (referenceImage && typeof referenceImage === 'string') {
      const match = referenceImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/png';
      const base64Data = match ? match[2] : referenceImage;
      refParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    // Call generateContent in parallel for the variations
    const promises = Array.from({ length: finalCount }).map(async (_, idx) => {
      const styleNuance = variationStyles[idx] || `Variation #${idx + 1}`;
      const isRemix = refParts.length > 0;
      const combinedPrompt = isRemix
        ? `Remix and transform this reference image with the following vibe: ${basePrompt}. Keep stylistic essence while producing a fresh, high-detail mobile phone wallpaper. ${styleNuance}. 9:16 mobile wallpaper framing.`
        : `${basePrompt}. Highly detailed 9:16 mobile phone wallpaper, ${styleNuance}, 8k quality aesthetic.`;

      const parts = [...refParts, { text: combinedPrompt }];

      try {
        const response = await ai.models.generateContent({
          model: validModel,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: targetAspect,
              imageSize: imageSize === '4K' ? '4K' : imageSize === '2K' ? '2K' : '1K',
            },
          },
        });

        let imageUrl: string | null = null;
        const candidateParts = response.candidates?.[0]?.content?.parts || [];
        for (const part of candidateParts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }

        if (!imageUrl) {
          throw new Error(`Variation ${idx + 1} did not return image data`);
        }

        return {
          id: `wall_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
          url: imageUrl,
          prompt: basePrompt,
          variationIndex: idx + 1,
          aspectRatio: targetAspect,
          imageSize,
          model: validModel,
          isRemix,
          createdAt: new Date().toISOString(),
        };
      } catch (err: any) {
        console.error(`Error generating variation ${idx + 1}:`, err?.message || err);
        throw err;
      }
    });

    const results = await Promise.allSettled(promises);
    const successfulWallpapers = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    if (successfulWallpapers.length === 0) {
      const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      const errorMessage = firstError?.reason?.message || 'Failed to generate wallpapers';
      return res.status(500).json({
        error: errorMessage,
        details: 'Image generation failed. Ensure a valid Gemini API key is configured with access to image generation.',
      });
    }

    return res.json({
      wallpapers: successfulWallpapers,
      totalGenerated: successfulWallpapers.length,
      requested: finalCount,
    });
  } catch (err: any) {
    console.error('Wallpapers endpoint error:', err);
    return res.status(500).json({
      error: err?.message || 'Internal server error while generating wallpapers.',
    });
  }
});

// Endpoint for Gemini multi-turn chatbot (Aura Stylist)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemInstruction = `You are "Aura Stylist", a world-class creative director and mobile wallpaper art director.
You help users brainstorm phone wallpaper vibes, color palettes, visual themes (e.g. rainy cyberpunk lo-fi, minimalist botanical, studio glassmorphism, vaporwave dusk, neo-brutalism, celestial fantasy, dark obsidian neon, anime film grain), and compose the best prompts for mobile phone wallpapers.

Behavior guidelines:
1. Provide vivid, inspiring, and concise design advice.
2. Whenever you suggest an aesthetic or wallpaper concept, ALWAYS conclude with a ready-to-generate prompt wrapped in [PROMPT: your detailed prompt here].
Example:
"For a cozy rainy lo-fi look, combine deep indigo rainfall with warm amber lamplight reflections:
[PROMPT: Cozy rainy lo-fi Tokyo cafe window at twilight, warm amber indoor glow, raindrops sliding down glass, soft bokeh headlights, 9:16 mobile wallpaper]"
This special tag enables the app to render an instant one-tap 'Generate this' button for the user!
3. Be conversational, stylish, and focused on visual storytelling for lock screens and home screens.`;

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const reply = response.text || "I've styled some wallpaper concepts for you! Let me know which vibe calls to you.";
    return res.json({ reply });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({
      error: err?.message || 'Chat error',
    });
  }
});

// Vite & Static middleware setup
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`AuraWall server running on http://0.0.0.0:${port}`);
});
