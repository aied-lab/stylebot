import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
  Maximize2,
  Check,
  RotateCcw,
  Sliders,
  Grid,
} from 'lucide-react';
import { OutfitAnalysis, CanvasThemeId } from '../types/stylist';
import { drawDashboardOnCanvas, CANVAS_THEMES } from '../utils/canvasRenderer';
import { speechManager } from '../utils/speech';

interface CanvasDashboardViewProps {
  analysis: OutfitAnalysis;
  userImageBase64: string;
  onRetake: () => void;
}

export const CanvasDashboardView: React.FC<CanvasDashboardViewProps> = ({
  analysis,
  userImageBase64,
  onRetake,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [currentTheme, setCurrentTheme] = useState<CanvasThemeId>('noir');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [copied, setCopied] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [dynamicMode, setDynamicMode] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Charon' | 'Zephyr'>('Kore');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Load Image Object
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = userImageBase64 || analysis.imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [userImageBase64, analysis.imageUrl]);

  // Entrance Animation from 0 to 1
  useEffect(() => {
    let start: number | null = null;
    const duration = 1200; // 1.2s entrance

    const animateIn = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimProgress(eased);

      if (p < 1) {
        requestAnimationFrame(animateIn);
      }
    };

    requestAnimationFrame(animateIn);

    // Auto-play voice commentary shortly after analysis loads for an impressive UX!
    const timer = setTimeout(() => {
      handlePlayVoice();
    }, 800);

    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [analysis.id]);

  // Continuous Canvas Render or Update
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawDashboardOnCanvas(canvas, analysis, imageObjRef.current, {
      themeId: currentTheme,
      progress: animProgress,
      audioLevel,
      showGrid,
    });
  }, [analysis, currentTheme, animProgress, audioLevel, showGrid]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Dynamic animation loop for audio pulsation / subtle canvas live vibe
  useEffect(() => {
    if (!dynamicMode && !isSpeaking) return;

    const loop = () => {
      renderCanvas();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [dynamicMode, isSpeaking, renderCanvas]);

  // Handle Voice Playback
  const handlePlayVoice = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
      setAudioLevel(0);
      return;
    }

    setSpeechError(null);
    setIsSpeaking(true);

    speechManager.speak(analysis.voiceCommentary, {
      voice: selectedVoice,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setAudioLevel(0);
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setSpeechError('語音朗讀已結束');
        setIsSpeaking(false);
        setAudioLevel(0);
      },
      onLevel: (lvl) => {
        setAudioLevel(lvl);
      },
    });
  };

  // Download High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure full render at progress = 1
    drawDashboardOnCanvas(canvas, analysis, imageObjRef.current, {
      themeId: currentTheme,
      progress: 1,
      audioLevel: 0,
      showGrid,
    });

    const link = document.createElement('a');
    link.download = `OOTD-Stylist-${analysis.grade}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    // Re-render current state
    renderCanvas();
  };

  // Copy Image to Clipboard
  const handleCopyClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }, 'image/png');
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Stylist Action Control Bar */}
      <div className="w-full max-w-5xl mb-6 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Voice Playback section */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayVoice}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg ${
              isSpeaking
                ? 'bg-amber-400 text-neutral-950 animate-pulse shadow-amber-400/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                暫停造型師語音
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                聆聽專屬造型評語
              </>
            )}
          </button>

          {/* Audio Waveform visualization */}
          <div className="flex items-center gap-1 h-7 px-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4].map((baseHeight, idx) => {
              const currentScale = isSpeaking
                ? Math.max(0.2, Math.min(1, baseHeight * (audioLevel * 1.8 + 0.4)))
                : 0.2;
              return (
                <div
                  key={idx}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${currentScale * 100}%`,
                    opacity: isSpeaking ? 0.9 : 0.3,
                  }}
                />
              );
            })}
          </div>

          {/* Voice selector */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-400 bg-neutral-950/60 border border-neutral-800 px-2 py-1.5 rounded-lg">
            <span>音色：</span>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as any)}
              className="bg-transparent text-amber-400 font-medium focus:outline-none cursor-pointer"
            >
              <option value="Kore" className="bg-neutral-900 text-white">
                Kore (高雅女聲)
              </option>
              <option value="Puck" className="bg-neutral-900 text-white">
                Puck (紳士磁性)
              </option>
              <option value="Zephyr" className="bg-neutral-900 text-white">
                Zephyr (溫柔專業)
              </option>
              <option value="Charon" className="bg-neutral-900 text-white">
                Charon (沈穩幹練)
              </option>
            </select>
          </div>
        </div>

        {/* Theme & Canvas Options */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Switcher Pills */}
          <div className="flex items-center bg-neutral-950/80 p-1 border border-neutral-800 rounded-xl">
            {(Object.keys(CANVAS_THEMES) as CanvasThemeId[]).map((tId) => {
              const theme = CANVAS_THEMES[tId];
              const isSelected = currentTheme === tId;
              return (
                <button
                  key={tId}
                  onClick={() => setCurrentTheme(tId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={theme.name}
                >
                  {theme.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Toggle Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="開關背景網格"
            className={`p-2 rounded-xl border transition ${
              showGrid
                ? 'bg-neutral-800 text-amber-400 border-amber-400/30'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Copy Image Button */}
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-medium text-xs transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                已複製畫布
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                複製圖片
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            導出高解析海報
          </button>

          {/* Re-analyze / Retake */}
          <button
            onClick={onRetake}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 transition"
            title="重新拍攝新穿搭"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spoken Commentary Quote Box */}
      <div className="w-full max-w-5xl mb-6 bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/5 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
        <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              AI 造型師現場語音講評
            </span>
            <span className="text-[11px] text-neutral-400">• 點擊上方按鈕隨時重播</span>
          </div>
          <p className="text-sm text-neutral-200 leading-relaxed font-serif italic">
            「{analysis.voiceCommentary}」
          </p>
        </div>
      </div>

      {/* High-Resolution Interactive Canvas Display */}
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950 flex justify-center p-2 sm:p-6 group">
        <div className="relative w-full max-w-[960px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/50">
          <canvas
            ref={canvasRef}
            width={1200}
            height={1600}
            className="w-full h-full object-contain block select-none"
          />

          {/* Floating Canvas Watermark / Quick Action Pill */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-neutral-300 font-mono flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CANVAS 2D ENGINE • 1200x1600 RETINA
          </div>
        </div>
      </div>
    </div>
  );
};
