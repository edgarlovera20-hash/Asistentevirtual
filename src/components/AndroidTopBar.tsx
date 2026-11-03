import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  MoreVertical, 
  Bot, 
  Sparkles, 
  QrCode, 
  Settings, 
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Mic
} from 'lucide-react';
import { NavigationTab } from '../types';
import { usePWAInstall } from '../utils/usePWAInstall';

interface AndroidTopBarProps {
  onOpenSearch: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  autoPilotGlobal: boolean;
  onToggleAutoPilot: () => void;
  onOpenBriefing: () => void;
  isDeviceConnected: boolean;
  onOpenVoiceDictation?: () => void;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  onOpenSearch,
  onNavigateTab,
  autoPilotGlobal,
  onToggleAutoPilot,
  onOpenBriefing,
  isDeviceConnected,
  onOpenVoiceDictation,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleShareApp = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator.share({
        title: 'WhatsApp AI Manager para Android',
        text: 'Mi app de WhatsApp con auto-respuestas autónomas y recordatorio de tareas con IA.',
        url: window.location.href,
      }).catch(() => {});
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-[#1f2c34] text-slate-100 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md select-none shrink-0 relative z-30">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold tracking-normal text-slate-100 flex items-center gap-1.5">
          <span>WhatsApp</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded font-mono font-medium border border-emerald-800/60">
            AI Pro
          </span>
        </h1>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1">
        {/* Quick Auto-Pilot Indicator & Toggle */}
        <button
          onClick={onToggleAutoPilot}
          className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer mr-1 ${
            autoPilotGlobal
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
          title="Auto-Piloto de IA"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${autoPilotGlobal ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="hidden xs:inline">Auto-Pilot</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="p-2 text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
          title="Buscar"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Voice Dictation button */}
        {onOpenVoiceDictation && (
          <button
            onClick={onOpenVoiceDictation}
            className="p-2 text-emerald-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Dictado por voz con IA (Tareas o Chat)"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* 3-Dots Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Más opciones"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Android Overflow Popup Menu */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-10 w-56 bg-[#233138] border border-slate-700 rounded-lg shadow-2xl py-1.5 z-50 text-xs text-slate-200 divide-y divide-slate-700/60 animate-fade-in">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigateTab('device');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center justify-between"
                  >
                    <span>Dispositivos vinculados</span>
                    {isDeviceConnected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('chatbot');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center justify-between text-emerald-400 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Chatbot de WhatsApp</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                      Auto-Responde
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenBriefing();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center gap-2 text-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Resumen Matutino con IA</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('simulator');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50"
                  >
                    Laboratorio de simulación
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigateTab('settings');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ajustes y Reglas de IA</span>
                  </button>

                  {isInstallable && !isInstalled && (
                    <button
                      onClick={() => {
                        install();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center gap-2 text-emerald-400 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Instalar App en Android</span>
                    </button>
                  )}

                  <button
                    onClick={handleShareApp}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 flex items-center gap-2 text-slate-300"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Compartir Aplicación</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
