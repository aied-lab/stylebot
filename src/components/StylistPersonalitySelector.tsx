import React from 'react';
import { StylistPersonality } from '../types/stylist';
import { Crown, Flame, Heart, Compass } from 'lucide-react';

interface StylistPersonalitySelectorProps {
  selectedPersona: StylistPersonality;
  onChangePersona: (persona: StylistPersonality) => void;
  targetOccasion: string;
  onChangeOccasion: (occ: string) => void;
}

export const STYLIST_PERSONAS: Array<{
  id: StylistPersonality;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tag: string;
}> = [
  {
    id: 'chic',
    title: '時裝總監 (Vogue Chic)',
    desc: '巴黎與米蘭高訂視野，點評優雅犀利，著重身型比例與高級氛圍。',
    icon: <Crown className="w-5 h-5 text-amber-400" />,
    tag: '國際視野',
  },
  {
    id: 'strict',
    title: '毒舌評審 (Critique Sharp)',
    desc: '時裝週毒舌評審，直言不諱點出穿搭雷區，提供立竿見影的改造良方。',
    icon: <Flame className="w-5 h-5 text-rose-400" />,
    tag: '極致嚴苛',
  },
  {
    id: 'gentle',
    title: '日系顧問 (Gentle Warmth)',
    desc: '親切溫暖的日系造型顧問，善於發掘個人特質，講求自然舒適與鬆弛感。',
    icon: <Heart className="w-5 h-5 text-pink-400" />,
    tag: '溫暖療癒',
  },
  {
    id: 'trend',
    title: '潮流先鋒 (Street Avant)',
    desc: '裏原宿與首爾街頭先鋒，熱愛結構性混搭、飾品細節與前衛實驗風格。',
    icon: <Compass className="w-5 h-5 text-emerald-400" />,
    tag: '前衛潮流',
  },
];

export const OCCASIONS = [
  '日常都會通勤',
  '文藝探店與展覽',
  '浪漫晚餐約會',
  '週末悠閒聚會',
  '派對商務酒會',
  '戶外輕運動休閒',
];

export const StylistPersonalitySelector: React.FC<StylistPersonalitySelectorProps> = ({
  selectedPersona,
  onChangePersona,
  targetOccasion,
  onChangeOccasion,
}) => {
  return (
    <div className="w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div>
        <label className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-3">
          ① 選擇專屬 AI 造型師顧問風格
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STYLIST_PERSONAS.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onChangePersona(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-neutral-800/80">{p.icon}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-medium">
                      {p.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-800/80">
        <label className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-2.5">
          ② 設定今日目標出席場合 (增強評估契合度)
        </label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => {
            const isSelected = targetOccasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => onChangeOccasion(occ)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
