import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Outfit analysis endpoint
app.post('/api/analyze-outfit', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', stylistPersonality = 'chic', targetOccasion } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 parameter' });
      return;
    }

    const ai = getGeminiClient();

    let cleanBase64 = imageBase64;
    if (imageBase64.includes('base64,')) {
      cleanBase64 = imageBase64.split('base64,')[1];
    }

    const personalityPrompts: Record<string, string> = {
      chic: '你是米蘭與巴黎高階時尚雜誌的特約造型總監，眼光銳利而充滿美感，講評優雅精準、鼓勵中帶有專業洞察。',
      strict: '你是毒舌但極度專業的高訂時裝週評審，標準極高、直言不諱，一針見血指出穿搭弱點並給予立竿見影的改造良方。',
      gentle: '你是親切溫暖的日系穿搭顧問，善於發掘每個人的氣質亮點，語氣溫柔鼓舞人心，著重於舒適度與自然氛圍的提升。',
      trend: '你是東京裏原宿與首爾街頭潮流先鋒，熱愛實驗性搭配、混搭文化與細節飾品，語言充滿活力與現代感。',
    };

    const chosenRole = personalityPrompts[stylistPersonality] || personalityPrompts.chic;
    const occasionInstruction = targetOccasion ? `目標出席場合為：【${targetOccasion}】，請結合此場合特別評估合宜度。` : '評估日常與社交場合的泛用合宜度。';

    const systemPrompt = `你是一位享譽國際的專業「造型設計師 (Fashion Stylist)」。
${chosenRole}
${occasionInstruction}

請仔細觀察照片中人物的全身/半身服飾搭配，從色彩學、身形比例、材質混搭、飾品配件、鞋履、整體風格等維度進行嚴謹且豐富的穿搭診斷。
請使用繁體中文輸出符合嚴格 JSON Schema 的評鑑報告。

注意：
1. 評分要真實有鑑別度（一般良好日常穿搭約 75~88 分，極佳穿搭 89~96 分，有明顯衝突或比例問題約 60~74 分），給予等級（S / A+ / A / B+ / B / C）。
2. 色彩分析需要提取照片中 3 到 5 個主要/輔助/點綴色彩的 Hex 色碼與名稱。
3. 提供具體、可操作性高的改造建議（例如：將褲管微卷一折露腳踝、增加一條深色皮帶重塑腰線、換成米白厚底德訓鞋破除沈重感等）。
4. voiceCommentary: 造型師的口頭講評（約 60~90 字，語氣生動自然，非常適合用來朗讀語音給用戶聽，先稱讚亮點、再點出一個最有感的點睛建議）。`;

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];

    let lastError: any = null;
    let parsed: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`Attempting outfit analysis with model: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: '請分析這套穿搭造型，生成完整的評分、色彩分析、衣著單品檢測與具體改善建議。',
              },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: '穿搭主題標題，如「雅痞極簡都會風」、「清爽日系慵懶 City Boy」',
                },
                score: {
                  type: Type.INTEGER,
                  description: '總評分 0-100',
                },
                grade: {
                  type: Type.STRING,
                  description: '等級評定，如 S, A+, A, B+, B, C',
                },
                styleCategory: {
                  type: Type.STRING,
                  description: '風格分類，如 Minimalist Clean Fit, Smart Casual, Streetwear, Old Money, Parisian Chic',
                },
                vibeKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3-5 個風格氛圍標籤，如「鬆弛感」「比例修長」「低飽和質感」',
                },
                dimensions: {
                  type: Type.OBJECT,
                  properties: {
                    colorHarmony: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        analysis: { type: Type.STRING },
                      },
                      required: ['score', 'analysis'],
                    },
                    silhouetteProportion: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        analysis: { type: Type.STRING },
                      },
                      required: ['score', 'analysis'],
                    },
                    occasionFit: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        analysis: { type: Type.STRING },
                      },
                      required: ['score', 'analysis'],
                    },
                    trendAndPersonality: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        analysis: { type: Type.STRING },
                      },
                      required: ['score', 'analysis'],
                    },
                    detailsAndAccessories: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        analysis: { type: Type.STRING },
                      },
                      required: ['score', 'analysis'],
                    },
                  },
                  required: [
                    'colorHarmony',
                    'silhouetteProportion',
                    'occasionFit',
                    'trendAndPersonality',
                    'detailsAndAccessories',
                  ],
                },
                colorPalette: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                      percentage: { type: Type.INTEGER },
                      role: { type: Type.STRING, description: '主色 / 輔助色 / 點綴色' },
                    },
                    required: ['name', 'hex', 'percentage', 'role'],
                  },
                },
                garments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: '如：上衣 / 外套 / 褲裝 / 裙裝 / 鞋履 / 配件 / 包款' },
                      item: { type: Type.STRING, description: '品項名稱，如：卡其寬版工裝夾克' },
                      verdict: { type: Type.STRING, description: '短評' },
                    },
                    required: ['type', 'item', 'verdict'],
                  },
                },
                highlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '穿搭的三大亮點優勢',
                },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      aspect: { type: Type.STRING, description: '改造維度：色彩 / 剪裁 / 配件 / 鞋包' },
                      tip: { type: Type.STRING, description: '具體改善建議說明' },
                      expectedImpact: { type: Type.STRING, description: '預期提升效果，如「視覺拉長 5cm」「注入視覺焦點」' },
                    },
                    required: ['aspect', 'tip', 'expectedImpact'],
                  },
                },
                suitableOccasions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '適合的 3 個場合',
                },
                seasonMatch: {
                  type: Type.STRING,
                  description: '季節適宜度，如「秋季微涼」、「初春日常」',
                },
                voiceCommentary: {
                  type: Type.STRING,
                  description: '語音朗讀專用講評（60-90字，生動親切或專業俐落，口語化繁體中文）',
                },
                fashionQuote: {
                  type: Type.STRING,
                  description: '一條精闢的穿搭金句',
                },
              },
              required: [
                'title',
                'score',
                'grade',
                'styleCategory',
                'vibeKeywords',
                'dimensions',
                'colorPalette',
                'garments',
                'highlights',
                'recommendations',
                'suitableOccasions',
                'seasonMatch',
                'voiceCommentary',
                'fashionQuote',
              ],
            },
          },
        });

        const text = response.text;
        if (text) {
          parsed = JSON.parse(text);
          console.log(`Outfit analysis succeeded using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} encountered error:`, err?.message || err);
        // Wait 600ms before trying the next fallback model
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!parsed) {
      throw lastError || new Error('All candidate models failed to respond');
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing outfit:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze outfit',
    });
  }
});

// Gemini TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Missing or invalid text parameter' });
      return;
    }

    const ai = getGeminiClient();

    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const selectedVoice = allowedVoices.includes(voice) ? voice : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Professional, elegant fashion stylist with warm and confident tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS');
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS Generation error (client can fallback to SpeechSynthesis):', error);
    res.status(500).json({
      error: error?.message || 'TTS generation failed',
    });
  }
});

// Static files / Vite middleware
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

// Vercel serves the frontend separately and imports this app as a function.
if (!process.env.VERCEL) {
  setupVite();
}

export default app;
