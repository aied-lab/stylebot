import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, X, Image as ImageIcon, Volume2 } from 'lucide-react';
import { SAMPLE_OUTFITS, SampleOutfitPreset } from '../data/sampleOutfits';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  onSelectSample: (sample: SampleOutfitPreset) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onSelectSample,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [frameGuide, setFrameGuide] = useState<'full' | 'half' | 'none'>('full');

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('無法啟用攝影鏡頭。請確認已授予相機權限，或直接選擇「照片上傳」與「經典示範穿搭」。');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedPreview) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, capturedPreview]);

  // Take Snapshot with 3s countdown
  const triggerSnapshot = () => {
    if (countdown !== null) return;
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        doSnap();
      }
    }, 1000);
  };

  const doSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 250);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreview(dataUrl);
    stopCamera();
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">拍下今日穿搭 (OOTD)</h2>
              <p className="text-xs text-neutral-400">請保持光線充足，全身或半身均可清晰診斷</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        {!capturedPreview && (
          <div className="flex border-b border-neutral-800 px-6 pt-3 bg-neutral-950/30 gap-2">
            <button
              onClick={() => {
                setActiveTab('camera');
                setCameraError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'camera'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              即時拍照
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              相簿上傳
            </button>
            <button
              onClick={() => {
                setActiveTab('samples');
                stopCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === 'samples'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              示範穿搭預覽
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[380px]">
          {/* Captured Preview Mode */}
          {capturedPreview ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-xl max-h-[460px] bg-neutral-950">
                <img
                  src={capturedPreview}
                  alt="Captured Look"
                  className="object-contain max-h-[440px] w-auto mx-auto rounded-lg"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-amber-300 font-medium">
                  ✓ 照片已備妥
                </div>
              </div>
              <div className="flex items-center gap-4 w-full justify-center pt-2">
                <button
                  onClick={handleRetake}
                  className="px-5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 font-medium text-sm transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新拍攝 / 選擇
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  開始 AI 造型評鑑
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab 1: Live Camera */}
              {activeTab === 'camera' && (
                <div className="relative w-full aspect-[3/4] max-w-md bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-inner flex items-center justify-center">
                  {cameraError ? (
                    <div className="p-6 text-center text-neutral-300 space-y-3">
                      <p className="text-sm text-red-400 font-medium">{cameraError}</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-amber-500 text-neutral-950 rounded-lg font-bold text-xs hover:bg-amber-400 transition"
                      >
                        切換至照片上傳
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${
                          facingMode === 'user' ? 'scale-x-[-1]' : ''
                        }`}
                      />

                      {/* Flash overlay */}
                      {isFlashing && (
                        <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200 opacity-90" />
                      )}

                      {/* Countdown badge */}
                      {countdown !== null && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <span className="text-7xl font-extrabold text-amber-400 animate-ping">
                            {countdown}
                          </span>
                        </div>
                      )}

                      {/* Framing guide overlay */}
                      {frameGuide !== 'none' && (
                        <div className="absolute inset-0 pointer-events-none border-[1.5px] border-amber-400/30 m-6 rounded-xl flex flex-col justify-between p-4">
                          <div className="flex justify-between items-center text-[10px] text-amber-300 font-mono tracking-widest uppercase">
                            <span>[OOTD GUIDE]</span>
                            <span>{frameGuide === 'full' ? 'FULL BODY' : 'UPPER TORSO'}</span>
                          </div>
                          {frameGuide === 'full' && (
                            <div className="border-t border-dashed border-amber-400/25 w-full self-center my-auto py-1 text-center text-[10px] text-amber-400/60 font-mono">
                              — 腰線建議基準線 (WAISTLINE) —
                            </div>
                          )}
                          <div className="text-[10px] text-neutral-400 text-center font-mono">
                            ALIGN WITH NATURAL LIGHTING
                          </div>
                        </div>
                      )}

                      {/* Floating camera toolbar */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                        <button
                          onClick={() =>
                            setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                          }
                          title="切換前後鏡頭"
                          className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 border border-white/20 transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setFrameGuide((prev) =>
                              prev === 'full' ? 'half' : prev === 'half' ? 'none' : 'full'
                            )
                          }
                          title="切換引導線"
                          className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-amber-400 hover:bg-black/90 border border-white/20 transition"
                        >
                          {frameGuide === 'full' ? '全身' : frameGuide === 'half' ? '半身' : '無標線'}
                        </button>
                      </div>

                      {/* Bottom Shutter Button */}
                      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 z-10">
                        <button
                          onClick={triggerSnapshot}
                          disabled={countdown !== null}
                          className="w-18 h-18 rounded-full border-4 border-amber-400 bg-white/20 hover:bg-amber-400/30 backdrop-blur-sm p-1.5 transition active:scale-95 shadow-xl flex items-center justify-center group"
                        >
                          <div className="w-full h-full bg-amber-400 rounded-full group-hover:bg-amber-300 transition shadow" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Upload */}
              {activeTab === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md aspect-[4/3] border-2 border-dashed border-neutral-700 hover:border-amber-400/70 rounded-2xl bg-neutral-950/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-4 rounded-full bg-neutral-800 group-hover:bg-amber-500/20 text-neutral-400 group-hover:text-amber-400 mb-3 transition">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-200 group-hover:text-white mb-1">
                    點擊上傳或拖曳穿搭照片
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    支援 JPG、PNG、WEBP 格式，請儘量選擇光線清晰、能夠看到服裝輪廓與色彩的照片
                  </p>
                </div>
              )}

              {/* Tab 3: Presets / Samples */}
              {activeTab === 'samples' && (
                <div className="w-full space-y-3">
                  <p className="text-xs text-neutral-400 text-center mb-1">
                    無相機或想快速體驗？點擊下方示範穿搭即刻體驗高擬真儀表板與 AI 語音講評：
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAMPLE_OUTFITS.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => {
                          onSelectSample(sample);
                          onClose();
                        }}
                        className="group bg-neutral-950 border border-neutral-800 hover:border-amber-400/80 rounded-xl overflow-hidden cursor-pointer transition shadow-md hover:shadow-amber-500/10 flex flex-col"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
                          <img
                            src={sample.imageUrl}
                            alt={sample.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute top-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-amber-500/30">
                            {sample.sampleAnalysis.grade} 級 • {sample.sampleAnalysis.score}分
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                            {sample.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{sample.style}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
