import React from 'react';

interface AndroidNavigationBarProps {
  onBack: () => void;
  onHome: () => void;
  onRecents: () => void;
}

export const AndroidNavigationBar: React.FC<AndroidNavigationBarProps> = ({
  onBack,
  onHome,
  onRecents,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  };

  return (
    <div className="h-10 bg-[#0b141a] text-slate-400 flex items-center justify-around px-8 select-none shrink-0 border-t border-slate-800/60">
      {/* Back button (Triangle) */}
      <button
        onClick={() => {
          triggerHaptic();
          onBack();
        }}
        className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
        title="Atrás (Android Back)"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 12a1 1 0 0 1-1 1H8.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z" />
        </svg>
      </button>

      {/* Home button (Circle) */}
      <button
        onClick={() => {
          triggerHaptic();
          onHome();
        }}
        className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
        title="Inicio (Android Home)"
      >
        <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
      </button>

      {/* Recents button (Square) */}
      <button
        onClick={() => {
          triggerHaptic();
          onRecents();
        }}
        className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
        title="Aplicaciones recientes"
      >
        <div className="w-3.5 h-3.5 rounded-xs border-2 border-current" />
      </button>
    </div>
  );
};
