/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Upload,
  Clock,
  RotateCcw,
  Volume2,
  Share2,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Palette,
  CheckCircle,
} from 'lucide-react';
import { OutfitAnalysis, StylistPersonality } from './types/stylist';
import { SAMPLE_OUTFITS, SampleOutfitPreset } from './data/sampleOutfits';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { CanvasDashboardView } from './components/CanvasDashboardView';
import { OutfitDetailCards } from './components/OutfitDetailCards';
import { StylistPersonalitySelector } from './components/StylistPersonalitySelector';
import { OutfitHistoryDrawer } from './components/OutfitHistoryDrawer';

const LOCAL_STORAGE_KEY = 'ai_stylist_ootd_history';

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<OutfitAnalysis | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Configuration options
  const [selectedPersona, setSelectedPersona] = useState<StylistPersonality>('chic');
  const [targetOccasion, setTargetOccasion] = useState('日常都會通勤');

  // History from localStorage
  const [history, setHistory] = useState<OutfitAnalysis[]>([]);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      }
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
  }, []);

  // Save to history helper
  const saveToHistory = (item: OutfitAnalysis) => {
    try {
      const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to history:', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Perform AI Analysis on Captured Photo
  const handlePhotoCaptured = async (imageDataUrl: string) => {
    setCurrentImage(imageDataUrl);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalyzingStep(1);

    // Step progression animation for delightful waiting experience
    const stepTimer1 = setTimeout(() => setAnalyzingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setAnalyzingStep(3), 2600);

    try {
      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          stylistPersonality: selectedPersona,
          targetOccasion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `伺服器回應錯誤 (${response.status})`);
      }

      const result = await response.json();
      const completeAnalysis: OutfitAnalysis = {
        ...result,
        id: `outfit-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: imageDataUrl,
      };

      setCurrentAnalysis(completeAnalysis);
      saveToHistory(completeAnalysis);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      const rawMsg = err.message || '';
      if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
        setErrorMessage(
          'Google AI 服務端當前處於高峰用量 (503 暫時繁忙)。後端已啟用自動負載轉移，請點擊下方「立即重新分析」，或先點擊「載入示範資料」立即體驗 Canvas 與語音！'
        );
      } else {
        setErrorMessage(
          rawMsg || '分析過程中發生錯誤。請確認網路連線與照片清晰度，或點擊下方嘗試示範穿搭。'
        );
      }
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
    }
  };

  // Load Preset Sample
  const handleSelectSample = (sample: SampleOutfitPreset) => {
    setCurrentImage(sample.imageUrl);
    setCurrentAnalysis(sample.sampleAnalysis);
    saveToHistory(sample.sampleAnalysis);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Editorial Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => {
              setCurrentAnalysis(null);
              setCurrentImage('');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white font-serif">
                  AI 造型設計師
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  HAUTE STUDIO
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 tracking-wider">
                穿搭智慧評分 • 動態畫布儀表板 • 造型師語音講評
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">歷史紀錄</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>拍照 / 上傳穿搭</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full max-w-3xl mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex-1">
              <p className="font-bold text-amber-300">連線狀態提示：</p>
              <p className="text-xs text-red-200 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {currentImage && (
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    handlePhotoCaptured(currentImage);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-neutral-950 font-bold whitespace-nowrap transition"
                >
                  立即重試分析
                </button>
              )}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  handleSelectSample(SAMPLE_OUTFITS[0]);
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium whitespace-nowrap border border-neutral-700 transition"
              >
                載入示範資料
              </button>
            </div>
          </div>
        )}

        {/* 1. ANALYZING / LOADING SCREEN */}
        {isAnalyzing && (
          <div className="w-full max-w-md my-16 p-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6 animate-pulse">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
              <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400">
                <Sparkles className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2 font-serif">
                AI 造型師正在細緻審美評鑑...
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {analyzingStep === 1 && '正在辨識服飾單品、版型輪廓與剪裁...'}
                {analyzingStep === 2 && '正在提取配色光譜、計算五大美學雷達維度...'}
                {analyzingStep >= 3 && '正在撰寫專屬語音講評與動態 Canvas 儀表板...'}
              </p>
            </div>

            <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
                style={{
                  width: `${analyzingStep === 1 ? 33 : analyzingStep === 2 ? 66 : 95}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* 2. RESULT DASHBOARD VIEW (WHEN OUTFIT IS ANALYZED) */}
        {!isAnalyzing && currentAnalysis && (
          <div className="w-full flex flex-col items-center animate-fade-in space-y-8">
            {/* Top Return / Retake Button Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentAnalysis(null);
                  setCurrentImage('');
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1.5 transition"
              >
                ← 返回主頁 / 重新選擇顧問
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  顧問：
                  <span className="text-amber-400 font-bold ml-1">
                    {selectedPersona === 'chic'
                      ? '時裝總監'
                      : selectedPersona === 'strict'
                      ? '毒舌評審'
                      : selectedPersona === 'gentle'
                      ? '日系顧問'
                      : '潮流先鋒'}
                  </span>
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-xs text-neutral-400">
                  場合：
                  <span className="text-neutral-200 ml-1">{targetOccasion}</span>
                </span>
              </div>
            </div>

            {/* Core Canvas Dashboard */}
            <CanvasDashboardView
              analysis={currentAnalysis}
              userImageBase64={currentImage}
              onRetake={() => setIsCameraModalOpen(true)}
            />

            {/* Interactive Detail Cards below Canvas */}
            <OutfitDetailCards analysis={currentAnalysis} />
          </div>
        )}

        {/* 3. HERO / EMPTY STATE (WHEN NO ANALYSIS ACTIVE) */}
        {!isAnalyzing && !currentAnalysis && (
          <div className="w-full max-w-5xl space-y-12 py-4 animate-fade-in">
            {/* Editorial Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 p-8 sm:p-12 text-center flex flex-col items-center space-y-6 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                2026 智慧時尚審美系統 • 即時拍照解析
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-serif max-w-3xl">
                拍下今日穿搭，
                <br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  一鍵生成動態 Canvas 雜誌儀表板
                </span>
                與造型師專屬語音講評
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
                結合精準色彩學、身材比例切割與單品輪廓分析。評分與建議以高質感圖文並茂的 Canvas
                畫布呈現，並由 AI 造型師現場語音講評，隨時導出專屬 OOTD 造型海報！
              </p>

              {/* Big CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full justify-center">
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-extrabold text-base shadow-xl shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  <span>立即開啟相機 / 拍照上傳</span>
                </button>

                <button
                  onClick={() => handleSelectSample(SAMPLE_OUTFITS[0])}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>直接試用示範穿搭</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">五大美學雷達</h5>
                    <p className="text-[11px] text-neutral-500">色彩、比例、場合、流行、細節</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">色彩光譜提取</h5>
                    <p className="text-[11px] text-neutral-500">主色、輔色、點綴色比例解析</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">真人語音講評</h5>
                    <p className="text-[11px] text-neutral-500">自然朗讀造型亮點與改善建議</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">高解析 Canvas 導出</h5>
                    <p className="text-[11px] text-neutral-500">1200x1600 雜誌封面級海報</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylist Persona & Occasion Configuration */}
            <StylistPersonalitySelector
              selectedPersona={selectedPersona}
              onChangePersona={setSelectedPersona}
              targetOccasion={targetOccasion}
              onChangeOccasion={setTargetOccasion}
            />

            {/* Sample Showcase Gallery */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    精選風格示範 (Lookbook Gallery)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    點擊任何一套經典穿搭，立即體驗動態 Canvas 儀表板與專屬語音講評
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SAMPLE_OUTFITS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="group bg-neutral-900/80 border border-neutral-800 hover:border-amber-400/80 rounded-2xl overflow-hidden cursor-pointer transition shadow-lg hover:shadow-amber-500/10 flex flex-col"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-950">
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold text-amber-400">
                        {sample.sampleAnalysis.grade} 級 • {sample.sampleAnalysis.score} 分
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
                        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest">
                          {sample.sampleAnalysis.styleCategory}
                        </span>
                        <h4 className="text-base font-bold text-white">{sample.name}</h4>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-neutral-950/60">
                      <p className="text-xs text-neutral-400 italic line-clamp-2">
                        “{sample.sampleAnalysis.voiceCommentary}”
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs text-amber-400 font-bold group-hover:text-amber-300">
                        <span>查看 Canvas 評鑑</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 text-center text-xs text-neutral-500 bg-neutral-950">
        <p>AI 造型設計師 (Haute Stylist Studio) • 智能穿搭診斷與動態 Canvas 視覺化儀表板</p>
      </footer>

      {/* Modals */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handlePhotoCaptured}
        onSelectSample={handleSelectSample}
      />

      <OutfitHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectOutfit={(outfit) => {
          setCurrentAnalysis(outfit);
          setCurrentImage(outfit.imageUrl);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
