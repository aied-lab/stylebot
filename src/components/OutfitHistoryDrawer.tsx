import React from 'react';
import { OutfitAnalysis } from '../types/stylist';
import { Clock, Trash2, X, ChevronRight, Award } from 'lucide-react';

interface OutfitHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: OutfitAnalysis[];
  onSelectOutfit: (outfit: OutfitAnalysis) => void;
  onClearHistory: () => void;
}

export const OutfitHistoryDrawer: React.FC<OutfitHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectOutfit,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sage-500/10 text-sage-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">穿搭評鑑紀錄 (Lookbook History)</h3>
              <p className="text-xs text-neutral-400">共 {history.length} 套造型診斷資料</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Award className="w-10 h-10 mb-2 opacity-40 text-sage-400" />
              <p className="text-sm font-medium">尚無評鑑紀錄</p>
              <p className="text-xs text-neutral-500 mt-1">
                拍下第一張照片或試用示範穿搭，AI 造型師將在此為您保存每套造型報告！
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectOutfit(item);
                  onClose();
                }}
                className="group p-3 bg-neutral-950 border border-neutral-800 hover:border-sage-400/80 rounded-xl cursor-pointer transition flex items-center gap-3.5 shadow-sm"
              >
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.2 rounded text-[10px] font-bold text-sage-400">
                    {item.grade}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-sage-300 transition truncate">
                      {item.title}
                    </h4>
                    <span className="text-xs font-extrabold text-sage-400 font-mono shrink-0 ml-1">
                      {item.score}分
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">{item.styleCategory}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {new Date(item.timestamp).toLocaleDateString('zh-TW', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-sage-400 group-hover:translate-x-0.5 transition shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/80">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清除所有歷史紀錄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
