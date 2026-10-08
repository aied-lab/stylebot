import React, { useState } from 'react';
import { OutfitAnalysis } from '../types/stylist';
import {
  Sparkles,
  Palette,
  Layers,
  Shirt,
  Calendar,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';

interface OutfitDetailCardsProps {
  analysis: OutfitAnalysis;
}

export const OutfitDetailCards: React.FC<OutfitDetailCardsProps> = ({ analysis }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const dimensionList = [
    {
      title: '色彩協調 (Color Harmony)',
      score: analysis.dimensions.colorHarmony.score,
      analysis: analysis.dimensions.colorHarmony.analysis,
      accent: 'from-amber-500 to-amber-600',
    },
    {
      title: '身形比例 (Silhouette & Proportions)',
      score: analysis.dimensions.silhouetteProportion.score,
      analysis: analysis.dimensions.silhouetteProportion.analysis,
      accent: 'from-blue-500 to-blue-600',
    },
    {
      title: '場合契合 (Occasion Appropriateness)',
      score: analysis.dimensions.occasionFit.score,
      analysis: analysis.dimensions.occasionFit.analysis,
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      title: '流行風範 (Trend & Personality)',
      score: analysis.dimensions.trendAndPersonality.score,
      analysis: analysis.dimensions.trendAndPersonality.analysis,
      accent: 'from-purple-500 to-purple-600',
    },
    {
      title: '細節飾品 (Details & Accessories)',
      score: analysis.dimensions.detailsAndAccessories.score,
      analysis: analysis.dimensions.detailsAndAccessories.analysis,
      accent: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <div className="w-full max-w-5xl space-y-8 mt-4">
      {/* 1. Highlights & Recommendations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highlights */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-wide">穿搭造型三大亮點 (Highlights)</h3>
          </div>
          <ul className="space-y-3">
            {analysis.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="leading-relaxed">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-wide">造型師升級錦囊 (Tips)</h3>
          </div>
          <div className="space-y-3.5">
            {analysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    【{rec.aspect}】
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {rec.expectedImpact}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{rec.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Color Palette Breakdown */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Palette className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-wide">色彩搭配比例光譜 (Palette Breakdown)</h3>
          </div>
          <span className="text-xs text-neutral-400">點擊色彩色碼可快速複製</span>
        </div>

        {/* Color proportion combined bar */}
        <div className="h-4 rounded-full overflow-hidden flex w-full mb-6 border border-white/10 shadow-inner">
          {analysis.colorPalette.map((col, idx) => (
            <div
              key={idx}
              style={{
                width: `${col.percentage}%`,
                backgroundColor: col.hex,
              }}
              title={`${col.name}: ${col.percentage}%`}
              className="h-full transition-all duration-300 relative group"
            />
          ))}
        </div>

        {/* Individual color cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {analysis.colorPalette.map((col, idx) => (
            <div
              key={idx}
              onClick={() => handleCopyHex(col.hex)}
              className="bg-neutral-950/80 border border-neutral-800 hover:border-amber-400/50 rounded-xl p-3 cursor-pointer transition group"
            >
              <div
                className="w-full h-12 rounded-lg mb-2.5 shadow-sm border border-white/15 transition group-hover:scale-[1.02]"
                style={{ backgroundColor: col.hex }}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{col.name}</span>
                  <span className="text-[10px] text-amber-400 font-bold">{col.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>{col.hex.toUpperCase()}</span>
                  {copiedHex === col.hex ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  定位：{col.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Five Dimensions Breakdown Cards */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 mb-2">
          <Layers className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-wide">五大美學維度深度剖析 (Dimensional Breakdown)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensionList.map((dim, idx) => (
            <div
              key={idx}
              className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-2.5 hover:border-neutral-700 transition"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-200">{dim.title}</h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold text-amber-400 font-mono">
                    {dim.score}
                  </span>
                  <span className="text-[11px] text-neutral-400">/100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${dim.accent} rounded-full transition-all duration-700`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">{dim.analysis}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Garments Detected */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 mb-4">
          <Shirt className="w-5 h-5" />
          <h3 className="text-base font-bold text-white tracking-wide">全身穿搭單品檢測 (Garments Detected)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {analysis.garments.map((g, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-bold">
                  {g.type}
                </span>
                <span className="text-xs font-bold text-white truncate">{g.item}</span>
              </div>
              <p className="text-xs text-neutral-400">{g.verdict}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
