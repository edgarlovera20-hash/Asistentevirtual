import React from 'react';
import { 
  Mic, 
  Square, 
  Trash2, 
  Check, 
  Sparkles, 
  AlertCircle,
  X,
  Volume2
} from 'lucide-react';

interface VoiceRecorderBarProps {
  isRecording: boolean;
  isTranscribing: boolean;
  durationFormatted: string;
  audioLevel: number;
  livePreview?: string;
  errorMessage?: string | null;
  modeLabel?: string;
  onCancel: () => void;
  onStopAndTranscribe: () => void;
  onClearError?: () => void;
}

export const VoiceRecorderBar: React.FC<VoiceRecorderBarProps> = ({
  isRecording,
  isTranscribing,
  durationFormatted,
  audioLevel,
  livePreview,
  errorMessage,
  modeLabel = 'Dictado de voz',
  onCancel,
  onStopAndTranscribe,
  onClearError,
}) => {
  if (!isRecording && !isTranscribing && !errorMessage) {
    return null;
  }

  // Generate dynamic bar heights based on current audio level
  const waveBars = [
    Math.max(15, (audioLevel * 0.4)),
    Math.max(25, (audioLevel * 0.75)),
    Math.max(40, (audioLevel * 1.1)),
    Math.max(20, (audioLevel * 0.6)),
    Math.max(50, (audioLevel * 1.25)),
    Math.max(30, (audioLevel * 0.85)),
    Math.max(20, (audioLevel * 0.5)),
  ];

  return (
    <div className="w-full bg-[#182229] border border-emerald-500/50 rounded-xl p-3 shadow-xl animate-fade-in flex flex-col gap-2 relative">
      {errorMessage ? (
        <div className="flex items-center justify-between text-xs text-red-300 bg-red-950/60 p-2 rounded-lg border border-red-800/60">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="p-1 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : isTranscribing ? (
        <div className="flex items-center justify-center gap-3 py-2 text-xs text-emerald-300">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span className="font-medium animate-pulse">
            Transcribiendo dictado de voz con IA...
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Main recording bar row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Recording indicator & timer */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="font-mono text-xs font-bold text-slate-100 tabular-nums">
                {durationFormatted}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase font-mono">
                {modeLabel}
              </span>
            </div>

            {/* Center: Live audio waveform equalizer */}
            <div className="flex-1 flex items-center justify-center gap-1 h-6 px-2 overflow-hidden">
              {waveBars.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.min(24, Math.max(6, (height * 24) / 100))}px`,
                    opacity: 0.6 + (height / 200),
                  }}
                />
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                title="Cancelar grabación"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onStopAndTranscribe}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00a884] hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Detener y transcribir con IA"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Listo</span>
              </button>
            </div>
          </div>

          {/* Live speech preview if user is speaking */}
          {livePreview ? (
            <div className="bg-[#111b21] rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 border border-slate-700/60 italic flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">"{livePreview}"</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Mic className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Habla con claridad cerca del micrófono para transcribir...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
