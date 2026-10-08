/**
 * Voice commentary player with Gemini TTS primary + SpeechSynthesis resilient fallback
 */

export interface SpeechOptions {
  voice?: 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onLevel?: (level: number) => void;
}

class SpeechManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private animFrameId: number | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.isSpeaking = false;
  }

  public async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    this.stop();
    this.isSpeaking = true;
    options.onStart?.();

    // Start simulated visualizer level loop as baseline
    let fakePhase = 0;
    const startSimulatedLevels = () => {
      const loop = () => {
        if (!this.isSpeaking) return;
        fakePhase += 0.15;
        // Natural pulsing between 0.2 and 0.85
        const val = 0.35 + Math.sin(fakePhase) * 0.25 + Math.sin(fakePhase * 2.3) * 0.15;
        options.onLevel?.(Math.max(0.1, Math.min(1, val)));
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    };

    startSimulatedLevels();

    // Try Gemini TTS first
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: options.voice || 'Kore',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;

          // Connect Web Audio API analyzer if possible
          try {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtxClass) {
              const ctx = new AudioCtxClass();
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 64;
              const source = ctx.createMediaElementSource(audio);
              source.connect(analyser);
              analyser.connect(ctx.destination);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const trackLevel = () => {
                if (!this.isSpeaking) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length / 255;
                options.onLevel?.(avg);
                requestAnimationFrame(trackLevel);
              };
              audio.onplay = () => {
                ctx.resume();
                trackLevel();
              };
            }
          } catch (e) {
            // Web Audio routing might fail on some restrictive browsers, fallback to simulated visualizer
          }

          audio.onended = () => {
            this.stop();
            options.onLevel?.(0);
            options.onEnd?.();
          };

          audio.onerror = () => {
            this.fallbackToSpeechSynthesis(text, options);
          };

          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS failed or unavailable, falling back to Web Speech API:', e);
    }

    // Fallback to Web Speech API
    this.fallbackToSpeechSynthesis(text, options);
  }

  private fallbackToSpeechSynthesis(text: string, options: SpeechOptions): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.stop();
      options.onError?.(new Error('Speech synthesis not supported on this browser'));
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.05;
    utterance.lang = 'zh-TW';

    // Try finding preferred Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(
      (v) => v.lang.includes('zh') || v.lang.includes('cmn') || v.name.includes('Taiwan') || v.name.includes('Chinese')
    );
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onend = () => {
      this.stop();
      options.onLevel?.(0);
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.stop();
      options.onLevel?.(0);
      options.onError?.(e);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechManager = new SpeechManager();
