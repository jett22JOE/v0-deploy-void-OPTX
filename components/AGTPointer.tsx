'use client';

interface AGTPointerProps {
  currentTensor: 'COG' | 'EMO' | 'ENV' | null;
  confidence: number;
  isActive: boolean;
}

const TENSOR_CONFIG = {
  COG: {
    emoji: '🧠',
    label: 'Cognitive',
    color: 'oklch(0.82 0.18 95)',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500',
  },
  EMO: {
    emoji: '❤️',
    label: 'Emotional',
    color: 'oklch(0.65 0.25 25)',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500',
  },
  ENV: {
    emoji: '🌍',
    label: 'Environmental',
    color: 'oklch(0.60 0.20 250)',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
  },
};

export function AGTPointer({ currentTensor, confidence, isActive }: AGTPointerProps) {
  if (!isActive || !currentTensor) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-black/30 rounded-lg border border-orange-500/20">
        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
          <span className="text-sm text-orange-500/40">●</span>
        </div>
        <div>
          <p className="text-xs text-orange-400/70">Inactive</p>
          <p className="text-[10px] text-orange-400/50">No active tensor</p>
        </div>
      </div>
    );
  }

  const config = TENSOR_CONFIG[currentTensor];

  return (
    <div className={`flex items-center gap-3 px-4 py-2 ${config.bgColor} rounded-lg border-2 ${config.borderColor} animate-pulse shadow-lg`}
      style={{ boxShadow: `0 4px 20px ${config.color}20` }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl shadow-md"
        style={{ backgroundColor: `${config.color}40` }}
      >
        {config.emoji}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-orange-100">{config.label}</p>
        <p className="text-xs font-semibold" style={{ color: config.color }}>
          {Math.round(confidence * 100)}% Confidence
        </p>
      </div>
      <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config.color }} />
    </div>
  );
}
